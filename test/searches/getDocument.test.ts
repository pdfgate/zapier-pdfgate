import { getDocument } from '../../src/searches/getDocument';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockDocument = {
  id: 'doc_123',
  status: 'completed',
  type: 'from_html',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('getDocument search', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { getDocument: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls getDocument with documentId mapped to id', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    const result = await (getDocument.operation.perform as Function)(z, bundle);

    expect(mockClient.getDocument).toHaveBeenCalledWith({ id: 'doc_123' });
    expect(result).toEqual([mockDocument]);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.getDocument.mockRejectedValue(new Error('Not found'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { documentId: 'doc_123' } } as any;

    await expect((getDocument.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
