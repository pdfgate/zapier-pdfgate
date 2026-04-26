import { envelopeInProgress } from '../../src/triggers/envelopeInProgress';
import { envelopeCompleted } from '../../src/triggers/envelopeCompleted';
import { envelopeExpired } from '../../src/triggers/envelopeExpired';
import { verifySignature, PdfGateSignatureVerificationError } from 'pdfgate';

jest.mock('pdfgate', () => ({
  verifySignature: jest.fn(),
  PdfGateSignatureVerificationError: class extends Error {},
  default: jest.fn(),
}));

const mockVerifySignature = verifySignature as jest.Mock;

const z = {
  errors: { Error: class extends Error {} },
  request: jest.fn(),
} as any;

const makeBundle = (event: string, subscribeSecret = 'secret123') => ({
  authData: { apiKey: 'test_key' },
  subscribeData: { id: 'wh_123', secret: subscribeSecret },
  rawRequest: {
    headers: { 'x-pdfgate-signature': 'v1=abc,t=123' },
    content: JSON.stringify({ event, envelopeId: 'env_1', status: event.split('.')[1] }),
  },
  cleanedRequest: {
    data: { event, envelopeId: 'env_1', status: event.split('.')[1] },
  },
});

describe('envelope triggers', () => {
  beforeEach(() => {
    z.request.mockReset();
    mockVerifySignature.mockReturnValue(undefined);
  });

  it('envelopeInProgress passes through envelope.sent events', async () => {
    const bundle = makeBundle('envelope.sent') as any;
    const result = await (envelopeInProgress.operation.perform as Function)(z, bundle);
    expect(result).toEqual([bundle.cleanedRequest.data]);
  });

  it('envelopeInProgress filters out other event types', async () => {
    const bundle = makeBundle('envelope.completed') as any;
    const result = await (envelopeInProgress.operation.perform as Function)(z, bundle);
    expect(result).toEqual([]);
  });

  it('envelopeCompleted passes through envelope.completed events', async () => {
    const bundle = makeBundle('envelope.completed') as any;
    const result = await (envelopeCompleted.operation.perform as Function)(z, bundle);
    expect(result).toEqual([bundle.cleanedRequest.data]);
  });

  it('envelopeExpired passes through envelope.expired events', async () => {
    const bundle = makeBundle('envelope.expired') as any;
    const result = await (envelopeExpired.operation.perform as Function)(z, bundle);
    expect(result).toEqual([bundle.cleanedRequest.data]);
  });

  it('throws z.errors.Error on signature verification failure', async () => {
    mockVerifySignature.mockImplementation(() => {
      throw new (PdfGateSignatureVerificationError as any)('Bad signature');
    });
    const bundle = makeBundle('envelope.completed') as any;

    await expect(
      (envelopeCompleted.operation.perform as Function)(z, bundle),
    ).rejects.toBeInstanceOf(z.errors.Error);
  });

  it('calls verifySignature with secret, header, and raw body', async () => {
    const bundle = makeBundle('envelope.completed') as any;
    await (envelopeCompleted.operation.perform as Function)(z, bundle);

    expect(mockVerifySignature).toHaveBeenCalledWith(
      'secret123',
      'v1=abc,t=123',
      bundle.rawRequest.content,
    );
  });

  it('uses legacy auth webhookSecret when subscribeData has no secret', async () => {
    const bundle = {
      ...makeBundle('envelope.completed', undefined),
      authData: { apiKey: 'test_key', webhookSecret: 'legacy_secret' },
      subscribeData: { id: 'wh_123' },
    } as any;

    await (envelopeCompleted.operation.perform as Function)(z, bundle);

    expect(mockVerifySignature).toHaveBeenCalledWith(
      'legacy_secret',
      'v1=abc,t=123',
      bundle.rawRequest.content,
    );
  });

  it('subscribes envelopeCompleted through the PDFGate webhook API', async () => {
    z.request.mockResolvedValue({ data: { id: 'wh_123', secret: 'whsecret_123' } });
    const bundle = {
      authData: { apiKey: 'test_key' },
      targetUrl: 'https://hooks.zapier.com/hooks/catch/123',
    } as any;

    const result = await (envelopeCompleted.operation.performSubscribe as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith({
      url: 'https://api-sandbox.pdfgate.com/webhook',
      method: 'POST',
      headers: {
        Authorization: 'Bearer test_key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: bundle.targetUrl,
        eventTypes: ['envelope.completed'],
      }),
    });
    expect(result).toEqual({ id: 'wh_123', secret: 'whsecret_123' });
  });

  it('subscribes envelopeInProgress with envelope.sent', async () => {
    z.request.mockResolvedValue({ data: { id: 'wh_123', secret: 'whsecret_123' } });
    const bundle = {
      authData: { apiKey: 'live_key' },
      targetUrl: 'https://hooks.zapier.com/hooks/catch/123',
    } as any;

    await (envelopeInProgress.operation.performSubscribe as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.pdfgate.com/webhook',
        body: JSON.stringify({
          url: bundle.targetUrl,
          eventTypes: ['envelope.sent'],
        }),
      }),
    );
  });

  it('unsubscribes using returned webhook id', async () => {
    z.request.mockResolvedValue({ data: { success: true } });
    const bundle = {
      authData: { apiKey: 'test_key' },
      subscribeData: { id: 'wh_123', secret: 'whsecret_123' },
    } as any;

    const result = await (envelopeExpired.operation.performUnsubscribe as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith({
      url: 'https://api-sandbox.pdfgate.com/webhook/wh_123',
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer test_key',
      },
    });
    expect(result).toEqual({ success: true });
  });

  it('loads backend sample payloads', async () => {
    z.request.mockResolvedValue({ data: { event: 'envelope.completed' } });
    const bundle = { authData: { apiKey: 'test_key' } } as any;

    const result = await (envelopeCompleted.operation.performList as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith({
      url: 'https://api-sandbox.pdfgate.com/webhook/envelope-completed-sample',
      method: 'GET',
      headers: {
        Authorization: 'Bearer test_key',
      },
    });
    expect(result).toEqual([{ event: 'envelope.completed' }]);
  });
});
