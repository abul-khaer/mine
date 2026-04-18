import { Controller, Get, Put, Post, Body, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SettingsService, UpdateSettingsDto } from './settings.service';
import { AuditService } from '../audit/audit.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private service: SettingsService,
    private auditService: AuditService,
  ) {}

  @Get('company')
  get() {
    return this.service.get();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put('company')
  async update(@Body() dto: UpdateSettingsDto, @Req() req: { user: { sub: number; email: string } }) {
    const result = await this.service.update(dto);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'UPDATE', resource: 'settings',
      details: { changes: Object.keys(dto) },
    });
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('company/logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => cb(null, `logo${extname(file.originalname)}`),
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req: { user: { sub: number; email: string } }) {
    const logoUrl = `/uploads/${file.filename}`;
    const result = await this.service.updateLogo(logoUrl);
    await this.auditService.log({
      userId: req.user.sub, userEmail: req.user.email,
      action: 'UPDATE', resource: 'settings',
      details: { field: 'logo', filename: file.filename },
    });
    return result;
  }
}
