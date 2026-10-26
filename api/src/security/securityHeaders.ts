import { HelmetOptions } from 'helmet';

const FONT_STYLESHEET_ORIGIN = 'https://fonts.googleapis.com';
const FONT_FILE_ORIGIN = 'https://fonts.gstatic.com';

export function securityHeaders(isProduction: boolean): HelmetOptions {
  if (!isProduction) {
    return { contentSecurityPolicy: false };
  }

  return {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'style-src': ["'self'", "'unsafe-inline'", FONT_STYLESHEET_ORIGIN],
        'font-src': ["'self'", FONT_FILE_ORIGIN],
        'connect-src': ["'self'"],
      },
    },
  };
}
