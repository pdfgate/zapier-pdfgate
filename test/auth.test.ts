import { authentication } from '../src/auth';
import { getClient } from '../src/client';

jest.mock('../src/client');
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
