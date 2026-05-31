import { deleteDocument } from '../../src/actions/deleteDocument';

const z = {
  errors: { Error: class extends Error {} },
  request: jest.fn(),
} as any;

describe('deleteDocument action', () => {
  beforeEach(() => {
    z.request.mockReset();
  });

  it('deletes a document by id in sandbox', async () => {
    z.request.mockResolvedValue({ data: { id: 'doc_123', deleted: true } });
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    const result = await (deleteDocument.operation.perform as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith({
      url: 'https://api-sandbox.pdfgate.com/document/doc_123',
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer test_key',
      },
    });
    expect(result).toEqual({ id: 'doc_123', deleted: true });
  });

  it('uses the production API for live keys', async () => {
    z.request.mockResolvedValue({ data: { id: 'doc_123', deleted: true } });
    const bundle = {
      authData: { apiKey: 'live_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    await (deleteDocument.operation.perform as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.pdfgate.com/document/doc_123',
      }),
    );
  });

  it('returns a fallback result when the endpoint has no response body', async () => {
    z.request.mockResolvedValue({});
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    const result = await (deleteDocument.operation.perform as Function)(z, bundle);

    expect(result).toEqual({ id: 'doc_123', deleted: true });
  });

  it('rethrows API errors as z.errors.Error', async () => {
    z.request.mockRejectedValue(new Error('Not found'));
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { documentId: 'doc_123' },
    } as any;

    await expect((deleteDocument.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
