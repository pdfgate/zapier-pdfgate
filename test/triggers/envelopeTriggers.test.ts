import { envelopeSent } from '../../src/triggers/envelopeSent';
import { envelopeCompleted } from '../../src/triggers/envelopeCompleted';

const z = {
  errors: { Error: class extends Error {} },
  request: jest.fn(),
} as any;

const makeBundle = (event: string, subscribeSecret = 'secret123') => ({
  authData: { apiKey: 'test_key' },
  subscribeData: { id: 'wh_123', secret: subscribeSecret },
  rawRequest: {
    headers: {
      'content-type': 'application/json',
      'x-pdfgate-signature': 'v1=abc,t=123',
    },
    content: JSON.stringify({ event, envelopeId: 'env_1', status: event.split('.')[1] }),
  },
  cleanedRequest: {
    event,
    envelopeId: 'env_1',
    status: event.split('.')[1],
  },
});

describe('envelope triggers', () => {
  beforeEach(() => {
    z.request.mockReset();
  });

  it('envelopeSent passes through envelope.sent events', async () => {
    const bundle = makeBundle('envelope.sent') as any;
    const result = await (envelopeSent.operation.perform as Function)(z, bundle);
    expect(result).toEqual([bundle.cleanedRequest]);
  });

  it('envelopeSent filters out other event types', async () => {
    const bundle = makeBundle('envelope.completed') as any;
    const result = await (envelopeSent.operation.perform as Function)(z, bundle);
    expect(result).toEqual([]);
  });

  it('envelopeCompleted passes through envelope.completed events', async () => {
    const bundle = makeBundle('envelope.completed') as any;
    const result = await (envelopeCompleted.operation.perform as Function)(z, bundle);
    expect(result).toEqual([bundle.cleanedRequest]);
  });

  it('uses cleanedRequest as the live webhook payload', async () => {
    const bundle = {
      ...makeBundle('envelope.completed'),
      rawRequest: {
        headers: {},
        content: '',
      },
      cleanedRequest: {
        event: 'envelope.completed',
        envelopeId: 'env_1',
      },
    } as any;

    const result = await (envelopeCompleted.operation.perform as Function)(z, bundle);

    expect(result).toEqual([bundle.cleanedRequest]);
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

  it('subscribes envelopeSent with envelope.sent', async () => {
    z.request.mockResolvedValue({ data: { id: 'wh_123', secret: 'whsecret_123' } });
    const bundle = {
      authData: { apiKey: 'live_key' },
      targetUrl: 'https://hooks.zapier.com/hooks/catch/123',
    } as any;

    await (envelopeSent.operation.performSubscribe as Function)(z, bundle);

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

    const result = await (envelopeCompleted.operation.performUnsubscribe as Function)(z, bundle);

    expect(z.request).toHaveBeenCalledWith({
      url: 'https://api-sandbox.pdfgate.com/webhook/wh_123',
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer test_key',
      },
    });
    expect(result).toEqual({ success: true });
  });

  it('returns static trigger samples from performList', async () => {
    const bundle = { authData: { apiKey: 'test_key' } } as any;

    const completed = await (envelopeCompleted.operation.performList as Function)(z, bundle);
    const sent = await (envelopeSent.operation.performList as Function)(z, bundle);

    expect(z.request).not.toHaveBeenCalled();
    expect(completed[0]).toMatchObject({
      event: 'envelope.completed',
      data: { envelope: { status: 'completed' } },
    });
    expect(sent[0]).toMatchObject({ event: 'envelope.sent' });
  });
});
