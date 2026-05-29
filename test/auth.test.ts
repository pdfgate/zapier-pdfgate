import { authentication } from '../src/auth';
import { withErrorHandling } from '../src/client';

const z = {
  errors: { Error: class extends Error {} },
  request: jest.fn(),
} as any;

describe('authentication', () => {
  beforeEach(() => {
    z.request.mockReset();
  });

  it('has the required apiKey field', () => {
    const fields = authentication.fields;
    expect(fields.find((f: any) => f.key === 'apiKey')).toBeDefined();
    expect(fields.find((f: any) => f.key === 'webhookSecret')).toBeUndefined();
  });

  it('passes auth test when /auth succeeds', async () => {
    z.request.mockResolvedValue({ data: { success: true } });
    const bundle = { authData: { apiKey: 'test_key' } } as any;

    await expect(authentication.test(z, bundle)).resolves.not.toThrow();
    expect(z.request).toHaveBeenCalledWith({
      url: 'https://api-sandbox.pdfgate.com/auth',
      method: 'GET',
      headers: {
        Authorization: 'Bearer test_key',
      },
    });
  });

  it('throws on auth test when /auth returns 401', async () => {
    z.request.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }));
    const bundle = { authData: { apiKey: 'test_badkey' } } as any;

    await expect(authentication.test(z, bundle)).rejects.toThrow();
  });

  it('uses the production API for live keys', async () => {
    z.request.mockResolvedValue({ data: { success: true } });
    const bundle = { authData: { apiKey: 'live_key' } } as any;

    await authentication.test(z, bundle);

    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.pdfgate.com/auth',
      }),
    );
  });
});

describe('withErrorHandling', () => {
  it('passes through the return value on success', async () => {
    const result = await withErrorHandling(z, async () => 'ok');
    expect(result).toBe('ok');
  });

  it('rethrows as z.errors.Error on generic failure', async () => {
    await expect(
      withErrorHandling(z, async () => { throw new Error('something broke'); }),
    ).rejects.toBeInstanceOf(z.errors.Error);
  });

  it('rethrows with auth message on 401', async () => {
    const err = Object.assign(new Error('Unauthorized'), { status: 401 });
    await expect(
      withErrorHandling(z, async () => { throw err; }),
    ).rejects.toThrow('PDFGate authentication failed');
  });
});
