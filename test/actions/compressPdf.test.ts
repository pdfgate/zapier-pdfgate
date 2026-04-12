import { compressPdf } from '../../src/actions/compressPdf';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockDocument = {
  id: 'doc_comp',
  status: 'completed',
  type: 'compressed',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('compressPdf action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { compressPdf: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls compressPdf with documentId and optional linearize', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123', linearize: true },
    } as any;

    const result = await (compressPdf.operation.perform as Function)(z, bundle);

    expect(mockClient.compressPdf).toHaveBeenCalledWith({ documentId: 'doc_123', linearize: true });
    expect(result).toEqual(mockDocument);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.compressPdf.mockRejectedValue(new Error('Failed'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { documentId: 'doc_123' } } as any;

    await expect((compressPdf.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
