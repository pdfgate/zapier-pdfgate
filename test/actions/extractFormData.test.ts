import { extractFormData } from '../../src/actions/extractFormData';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

describe('extractFormData action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      extractPdfFormData: jest.fn().mockResolvedValue({ name: 'Alice', age: '30' }),
    };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls extractPdfFormData with documentId', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    const result = await (extractFormData.operation.perform as Function)(z, bundle);

    expect(mockClient.extractPdfFormData).toHaveBeenCalledWith({ documentId: 'doc_123' });
    expect(result).toEqual({ name: 'Alice', age: '30' });
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.extractPdfFormData.mockRejectedValue(new Error('Not found'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { documentId: 'doc_123' } } as any;

    await expect((extractFormData.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
