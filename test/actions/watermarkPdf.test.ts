import { watermarkPdf } from '../../src/actions/watermarkPdf';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockDocument = {
  id: 'doc_wm',
  status: 'completed',
  type: 'watermarked',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('watermarkPdf action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { watermarkPdf: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls watermarkPdf with type text and provided fields', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123', text: 'CONFIDENTIAL', opacity: 0.5 },
    } as any;

    const result = await (watermarkPdf.operation.perform as Function)(z, bundle);

    expect(mockClient.watermarkPdf).toHaveBeenCalledWith({
      documentId: 'doc_123',
      text: 'CONFIDENTIAL',
      opacity: 0.5,
      type: 'text',
    });
    expect(result).toEqual(mockDocument);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.watermarkPdf.mockRejectedValue(new Error('Failed'));
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123', text: 'DRAFT' },
    } as any;

    await expect((watermarkPdf.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
