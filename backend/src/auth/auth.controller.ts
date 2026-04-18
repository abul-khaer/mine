import { Controller, Post, Body, UseGuards, Req, Ip, Headers } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

class Setup2faDto {
  @IsString()
  token: string;
}

class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  new_password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  // ═══ OWASP A07: Stricter rate limit on login ═══
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto.email, dto.password, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  generate2fa(@Req() req: { user: { sub: number; email: string } }) {
    return this.authService.generate2faSecret(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  enable2fa(@Req() req: { user: { sub: number; email: string } }, @Body() dto: Setup2faDto) {
    return this.authService.enable2fa(req.user.sub, dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  disable2fa(@Req() req: { user: { sub: number; email: string } }, @Body() dto: Setup2faDto) {
    return this.authService.disable2fa(req.user.sub, dto.token);
  }

  // ═══ OWASP A07: Stricter rate limit on password reset ═══
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @Post('reset-password')
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.resetPassword(dto.email, dto.token, dto.new_password, ip, userAgent);
  }

  @Post('check-2fa')
  check2fa(@Body('email') email: string) {
    return this.authService.check2faStatus(email);
  }

  // ═══ ISO 27001 A.9.2.6: Logout logging ═══
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: { user: { sub: number; email: string } },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'LOGOUT', resource: 'auth',
      ipAddress: ip, userAgent, status: 'success',
    });
    return { message: 'Logged out' };
  }
}
