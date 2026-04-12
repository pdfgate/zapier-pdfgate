import { protectPdf } from '../../src/actions/protectPdf';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockDocument = {
  id: 'doc_prot',
  status: 'completed',
  type: 'encrypted',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('protectPdf action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { protectPdf: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls protectPdf with documentId and algorithm', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123', algorithm: 'AES256', userPassword: 'secret' },
    } as any;

    const result = await (protectPdf.operation.perform as Function)(z, bundle);

    expect(mockClient.protectPdf).toHaveBeenCalledWith({
      documentId: 'doc_123',
      algorithm: 'AES256',
      userPassword: 'secret',
    });
    expect(result).toEqual(mockDocument);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.protectPdf.mockRejectedValue(new Error('Failed'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { documentId: 'doc_123' } } as any;

    await expect((protectPdf.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
