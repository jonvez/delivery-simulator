import request from 'supertest';

/**
 * CORS Lockdown Tests (ADR 0008, security requirement #5)
 *
 * The server must restrict CORS to allowed origins from `CORS_ORIGIN` env,
 * defaulting to the local Vite dev origin when unset (local dev must keep working).
 * A request from an allowed origin gets the `access-control-allow-origin` header
 * reflected; a disallowed origin does not.
 *
 * NOTE: `server.ts` reads CORS config at import time, so each scenario sets the env
 * and imports a fresh module instance via `jest.isolateModules`.
 */

function loadAppWithEnv(corsOrigin: string | undefined): import('express').Express {
  let app!: import('express').Express;
  jest.isolateModules(() => {
    if (corsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = corsOrigin;
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    app = require('../server').default;
  });
  return app;
}

describe('CORS lockdown', () => {
  const originalCorsOrigin = process.env.CORS_ORIGIN;

  afterAll(() => {
    if (originalCorsOrigin === undefined) {
      delete process.env.CORS_ORIGIN;
    } else {
      process.env.CORS_ORIGIN = originalCorsOrigin;
    }
  });

  describe('with CORS_ORIGIN set (production-style)', () => {
    const allowed = 'https://my-project.web.app';

    it('reflects the allow-origin header for an allowed origin', async () => {
      const app = loadAppWithEnv(allowed);
      const res = await request(app).get('/api/health').set('Origin', allowed);
      expect(res.headers['access-control-allow-origin']).toBe(allowed);
    });

    it('does NOT set the allow-origin header for a disallowed origin', async () => {
      const app = loadAppWithEnv(allowed);
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://evil.example.com');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('supports a comma-separated allowlist', async () => {
      const app = loadAppWithEnv('https://a.web.app, https://b.web.app');
      const resA = await request(app)
        .get('/api/health')
        .set('Origin', 'https://a.web.app');
      const resB = await request(app)
        .get('/api/health')
        .set('Origin', 'https://b.web.app');
      expect(resA.headers['access-control-allow-origin']).toBe('https://a.web.app');
      expect(resB.headers['access-control-allow-origin']).toBe('https://b.web.app');
    });
  });

  describe('with CORS_ORIGIN unset (local dev default)', () => {
    it('allows the Vite dev origin http://localhost:5173', async () => {
      const app = loadAppWithEnv(undefined);
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('does NOT allow an arbitrary remote origin by default', async () => {
      const app = loadAppWithEnv(undefined);
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://evil.example.com');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('preflight (OPTIONS) for mutating methods', () => {
    it('allows PATCH/PUT/DELETE/POST from an allowed origin', async () => {
      const allowed = 'https://my-project.web.app';
      const app = loadAppWithEnv(allowed);
      const res = await request(app)
        .options('/api/orders')
        .set('Origin', allowed)
        .set('Access-Control-Request-Method', 'PATCH');
      expect(res.headers['access-control-allow-origin']).toBe(allowed);
      const allowMethods = res.headers['access-control-allow-methods'] || '';
      expect(allowMethods).toContain('PATCH');
      expect(allowMethods).toContain('DELETE');
    });
  });
});
