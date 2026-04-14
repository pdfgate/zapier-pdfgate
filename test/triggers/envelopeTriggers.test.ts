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

const z = { errors: { Error: class extends Error {} } } as any;

const makeBundle = (event: string) => ({
  authData: { webhookSecret: 'secret123' },
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
    mockVerifySignature.mockReturnValue(undefined);
  });

  it('envelopeInProgress passes through envelope.in_progress events', async () => {
    const bundle = makeBundle('envelope.in_progress') as any;
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
});
