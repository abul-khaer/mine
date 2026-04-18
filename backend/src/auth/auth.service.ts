import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TOTP, generateSecret, generateURI, verify } from 'otplib';
import * as QRCode from 'qrcode';
import { User } from '../entities/user.entity';
import { AuditService } from '../audit/audit.service';

// ═══ ISO 27001 A.9.4.3: Password Policy ═══
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

// ═══ ISO 27001 A.9.4.2: Account Lockout ═══
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory failed login tracker (per-process)
const failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  validatePasswordStrength(password: string): void {
    const errors: string[] = [];
    if (password.length < PASSWORD_POLICY.minLength)
      errors.push(`Minimal ${PASSWORD_POLICY.minLength} karakter`);
    if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password))
      errors.push('Harus mengandung huruf besar');
    if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password))
      errors.push('Harus mengandung huruf kecil');
    if (PASSWORD_POLICY.requireNumber && !/\d/.test(password))
      errors.push('Harus mengandung angka');
    if (PASSWORD_POLICY.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      errors.push('Harus mengandung karakter spesial (!@#$%...)');
    if (errors.length > 0)
      throw new BadRequestException({ message: 'Password tidak memenuhi kebijakan keamanan', errors });
  }

  private checkAccountLockout(email: string): void {
    const record = failedAttempts.get(email);
    if (record?.lockedUntil && record.lockedUntil > new Date()) {
      const remainingMs = record.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new ForbiddenException(
        `Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${remainingMin} menit.`,
      );
    }
  }

  private recordFailedLogin(email: string): void {
    const record = failedAttempts.get(email) || { count: 0 };
    record.count += 1;
    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }
    failedAttempts.set(email, record);
  }

  private clearFailedLogin(email: string): void {
    failedAttempts.delete(email);
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    // Check lockout
    this.checkAccountLockout(email);

    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role', 'mine_id', 'totp_enabled', 'menu_access'],
      relations: ['mine'],
    });

    if (!user) {
      await this.auditService.log({
        action: 'LOGIN_FAILED', resource: 'auth', userEmail: email,
        details: { reason: 'User not found' }, ipAddress: ip, userAgent, status: 'failed',
      });
      this.recordFailedLogin(email);
      throw new UnauthorizedException('Email atau password salah');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await this.auditService.log({
        userId: user.id, userEmail: email,
        action: 'LOGIN_FAILED', resource: 'auth',
        details: { reason: 'Invalid password' }, ipAddress: ip, userAgent, status: 'failed',
      });
      this.recordFailedLogin(email);

      const record = failedAttempts.get(email);
      if (record?.lockedUntil) {
        await this.auditService.log({
          userId: user.id, userEmail: email,
          action: 'ACCOUNT_LOCKED', resource: 'auth',
          details: { reason: `Locked after ${MAX_FAILED_ATTEMPTS} failed attempts` },
          ipAddress: ip, userAgent, status: 'blocked',
        });
      }
      throw new UnauthorizedException('Email atau password salah');
    }

    // Successful login — clear failed attempts
    this.clearFailedLogin(email);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password: _, ...userWithoutPassword } = user;

    await this.auditService.log({
      userId: user.id, userEmail: email,
      action: 'LOGIN', resource: 'auth',
      ipAddress: ip, userAgent, status: 'success',
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async generate2faSecret(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: 'Mining Management', label: user.email, secret });

    await this.userRepo.update(userId, { totp_secret: secret });

    const qrCode = await QRCode.toDataURL(otpauthUrl);

    await this.auditService.log({
      userId, userEmail: user.email,
      action: '2FA_GENERATE', resource: 'auth',
    });

    return { secret, qrCode };
  }

  async enable2fa(userId: number, token: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'totp_secret'],
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (!user.totp_secret) throw new BadRequestException('Generate 2FA secret terlebih dahulu');

    const isValid = verify({ token, secret: user.totp_secret });
    if (!isValid) throw new BadRequestException('Kode OTP tidak valid');

    await this.userRepo.update(userId, { totp_enabled: true });

    await this.auditService.log({
      userId, userEmail: user.email,
      action: '2FA_ENABLED', resource: 'auth',
    });

    return { message: 'Google Authenticator berhasil diaktifkan' };
  }

  async disable2fa(userId: number, token: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'totp_secret', 'totp_enabled'],
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    if (!user.totp_enabled) throw new BadRequestException('2FA belum diaktifkan');

    const isValid = verify({ token, secret: user.totp_secret });
    if (!isValid) throw new BadRequestException('Kode OTP tidak valid');

    await this.userRepo.update(userId, { totp_enabled: false, totp_secret: undefined as unknown as string });

    await this.auditService.log({
      userId, userEmail: user.email,
      action: '2FA_DISABLED', resource: 'auth',
    });

    return { message: 'Google Authenticator berhasil dinonaktifkan' };
  }

  async check2faStatus(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'totp_enabled'],
    });
    if (!user) return { has_2fa: false };
    return { has_2fa: user.totp_enabled };
  }

  async resetPassword(email: string, token: string, newPassword: string, ip?: string, userAgent?: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'totp_secret', 'totp_enabled'],
    });

    if (!user) throw new NotFoundException('Email tidak ditemukan');
    if (!user.totp_enabled || !user.totp_secret) {
      throw new BadRequestException('Google Authenticator belum diaktifkan untuk akun ini. Hubungi admin untuk reset password.');
    }

    const isValid = verify({ token, secret: user.totp_secret });
    if (!isValid) throw new BadRequestException('Kode OTP tidak valid');

    // Enforce password policy on reset
    this.validatePasswordStrength(newPassword);

    const hashed = await this.hashPassword(newPassword);
    await this.userRepo.update(user.id, { password: hashed });

    await this.auditService.log({
      userId: user.id, userEmail: email,
      action: 'PASSWORD_RESET', resource: 'auth',
      ipAddress: ip, userAgent, status: 'success',
    });

    return { message: 'Password berhasil direset' };
  }
}
