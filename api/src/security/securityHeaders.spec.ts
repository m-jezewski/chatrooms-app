import helmet from 'helmet';
import { IncomingMessage, ServerResponse } from 'http';
import { securityHeaders } from './securityHeaders';

describe('securityHeaders', () => {
  const appliedHeaders = (isProduction: boolean) => {
    const headers = new Map<string, string>();
    const response = {
      setHeader: (name: string, value: string) => headers.set(name.toLowerCase(), value),
      removeHeader: (name: string) => headers.delete(name.toLowerCase()),
    } as unknown as ServerResponse;

    helmet(securityHeaders(isProduction))({} as IncomingMessage, response, () => undefined);

    return headers;
  };

  const productionDirective = (name: string) =>
    (appliedHeaders(true).get('content-security-policy') ?? '')
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry === name || entry.startsWith(`${name} `));

  it('allows scripts only from the origin that served the page', () => {
    expect(productionDirective('script-src')).toBe("script-src 'self'");
    expect(productionDirective('base-uri')).toBe("base-uri 'self'");
    expect(productionDirective('object-src')).toBe("object-src 'none'");
  });

  it('allows the stylesheet the toast library injects at runtime and the one from google fonts', () => {
    expect(productionDirective('style-src')).toBe("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com");
  });

  it('allows font files only from google fonts', () => {
    expect(productionDirective('font-src')).toBe("font-src 'self' https://fonts.gstatic.com");
  });

  it('allows requests and the websocket only to the origin that served the page', () => {
    expect(productionDirective('connect-src')).toBe("connect-src 'self'");
  });

  it('leaves insecure requests alone so the built client can be opened over plain http', () => {
    expect(productionDirective('upgrade-insecure-requests')).toBeUndefined();
  });

  it('refuses framing by other origins', () => {
    expect(productionDirective('frame-ancestors')).toBe("frame-ancestors 'self'");
    expect(appliedHeaders(true).get('x-frame-options')).toBe('SAMEORIGIN');
  });

  it('skips the policy outside production, where the client is served by vite, but keeps the other headers', () => {
    const headers = appliedHeaders(false);

    expect(headers.has('content-security-policy')).toBe(false);
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
  });
});
