import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // ═══ OWASP A05: Security Misconfiguration ═══
  // Helmet sets security HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // allow images from uploads
    }),
  );

  // Cookie parser for secure cookie handling
  app.use(cookieParser());

  // ═══ OWASP A05: CORS — strict origin ═══
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 600,
  });

  // ═══ OWASP A03: XSS Prevention — Sanitize inputs ═══
  app.useGlobalPipes(new SanitizePipe());

  // ═══ OWASP A03: Injection Prevention — Input Validation ═══
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip unknown properties
      forbidNonWhitelisted: true, // Reject requests with unknown properties
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // ═══ ISO 27001: Disable tech fingerprinting ═══
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
