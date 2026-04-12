import { authentication } from '../src/auth';
import { getClient, withErrorHandling } from '../src/client';

jest.mock('../src/client', () => ({
  ...jest.requireActual('../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = {
  errors: { Error: class extends Error {} },
} as any;

describe('authentication', () => {
  it('has required fields for apiKey and webhookSecret', () => {
    const fields = authentication.fields;
    expect(fields.find((f: any) => f.key === 'apiKey')).toBeDefined();
    expect(fields.find((f: any) => f.key === 'webhookSecret')).toBeDefined();
  });

  it('passes auth test when getDocument returns 404', async () => {
    const mockClient = {
      getDocument: jest.fn().mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 })),
    };
    mockGetClient.mockReturnValue(mockClient);

    const bundle = { authData: { apiKey: 'test_key' } } as any;
    await expect(authentication.test(z, bundle)).resolves.not.toThrow();
  });

  it('throws on auth test when getDocument returns 401', async () => {
    const mockClient = {
      getDocument: jest.fn().mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 })),
    };
    mockGetClient.mockReturnValue(mockClient);

    const bundle = { authData: { apiKey: 'test_badkey' } } as any;
    await expect(authentication.test(z, bundle)).rejects.toThrow();
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
