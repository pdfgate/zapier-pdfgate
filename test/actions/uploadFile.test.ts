import { uploadFile } from '../../src/actions/uploadFile';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockDocument = {
  id: 'doc_456',
  status: 'completed',
  type: 'uploaded',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('uploadFile action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { uploadFile: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls uploadFile with url from inputData', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { url: 'https://example.com/file.pdf' },
    } as any;

    const result = await (uploadFile.operation.perform as Function)(z, bundle);

    expect(mockClient.uploadFile).toHaveBeenCalledWith({ url: 'https://example.com/file.pdf' });
    expect(result).toEqual(mockDocument);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.uploadFile.mockRejectedValue(new Error('Upload failed'));
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { url: 'https://example.com/file.pdf' },
    } as any;

    await expect((uploadFile.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
