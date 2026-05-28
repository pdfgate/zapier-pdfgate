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

  it('passes expanded request params and builds nested object fields', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        url: 'https://example.com',
        preSignedUrlExpiresIn: 3600,
        pageSizeType: 'letter',
        width: 800,
        height: 1200,
        orientation: 'portrait',
        header: '<div>Header</div>',
        footer: '<div>Footer</div>',
        marginTop: '20px',
        marginBottom: '20px',
        marginLeft: '10px',
        marginRight: '10px',
        timeout: 30000,
        javascript: 'window.ready = true;',
        css: 'body { color: black; }',
        emulateMediaType: 'print',
        waitForSelector: '#ready',
        clickSelector: '#accept',
        clickSelectorChainSetup: {
          ignoreFailingChains: true,
          chains: [{ selectors: ['#cookieDialog'] }],
        },
        waitForNetworkIdle: true,
        delay: 1000,
        loadImages: true,
        scale: 1.2,
        pageRanges: '1-3',
        printBackground: true,
        userAgent: 'PDFGate Zapier Test',
        httpHeaders: { 'x-test': 'true' },
        authenticationUsername: 'user',
        authenticationAccessCode: 'pass',
        viewportWidth: 1280,
        viewportHeight: 720,
        enableFormFields: true,
        metadata: '{"source":"zapier"}',
      },
    } as any;

    await (generatePdf.operation.perform as Function)(z, bundle);

    expect(mockClient.generatePdf).toHaveBeenCalledWith({
      url: 'https://example.com',
      preSignedUrlExpiresIn: 3600,
      pageSizeType: 'letter',
      width: 800,
      height: 1200,
      orientation: 'portrait',
      header: '<div>Header</div>',
      footer: '<div>Footer</div>',
      margin: { top: '20px', bottom: '20px', left: '10px', right: '10px' },
      timeout: 30000,
      javascript: 'window.ready = true;',
      css: 'body { color: black; }',
      emulateMediaType: 'print',
      waitForSelector: '#ready',
      clickSelector: '#accept',
      clickSelectorChainSetup: {
        ignoreFailingChains: true,
        chains: [{ selectors: ['#cookieDialog'] }],
      },
      waitForNetworkIdle: true,
      delay: 1000,
      loadImages: true,
      scale: 1.2,
      pageRanges: '1-3',
      printBackground: true,
      userAgent: 'PDFGate Zapier Test',
      httpHeaders: { 'x-test': 'true' },
      authentication: { username: 'user', password: 'pass' },
      viewport: { width: 1280, height: 720 },
      enableFormFields: true,
      metadata: { source: 'zapier' },
    });
  });

  it('throws z.errors.Error when JSON object fields are invalid', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { url: 'https://example.com', metadata: 'not-json' },
    } as any;

    await expect((generatePdf.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
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
