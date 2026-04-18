import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml = require('sanitize-html');

// ═══ OWASP A03: XSS Prevention — Sanitize all string inputs ═══
@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      return this.sanitize(value);
    }
    return value;
  }

  private sanitize(value: any): any {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'recursiveEscape',
      });
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }
    if (value && typeof value === 'object') {
      const sanitized: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        sanitized[key] = this.sanitize(value[key]);
      }
      return sanitized;
    }
    return value;
  }
}
