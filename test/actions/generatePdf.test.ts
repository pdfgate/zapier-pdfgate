import { generatePdf } from '../../src/actions/generatePdf';
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
  fileUrl: 'https://example.com/file.pdf',
  size: 1024,
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

describe('generatePdf action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { generatePdf: jest.fn().mockResolvedValue(mockDocument) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls generatePdf with url from inputData', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { url: 'https://example.com' },
    } as any;

    const result = await (generatePdf.operation.perform as Function)(z, bundle);

    expect(mockClient.generatePdf).toHaveBeenCalledWith({ url: 'https://example.com' });
    expect(result).toEqual(mockDocument);
  });

  it('calls generatePdf with html from inputData', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { html: '<h1>Hello</h1>' },
    } as any;

    await (generatePdf.operation.perform as Function)(z, bundle);

    expect(mockClient.generatePdf).toHaveBeenCalledWith({ html: '<h1>Hello</h1>' });
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.generatePdf.mockRejectedValue(new Error('Bad request'));
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { url: 'https://example.com' },
    } as any;

    await expect((generatePdf.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
