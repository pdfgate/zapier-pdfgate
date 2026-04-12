import { flattenPdf } from '../../src/actions/flattenPdf';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockDocument = {
  id: 'doc_flat',
  status: 'completed',
  type: 'flattened',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('flattenPdf action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { flattenPdf: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls flattenPdf with documentId', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    const result = await (flattenPdf.operation.perform as Function)(z, bundle);

    expect(mockClient.flattenPdf).toHaveBeenCalledWith({ documentId: 'doc_123' });
    expect(result).toEqual(mockDocument);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.flattenPdf.mockRejectedValue(new Error('Failed'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { documentId: 'doc_123' } } as any;

    await expect((flattenPdf.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
