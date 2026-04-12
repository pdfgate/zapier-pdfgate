import { createHmac, timingSafeEqual } from 'crypto';

export class PdfGateSignatureVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfGateSignatureVerificationError';
  }
}

/**
 * Verify a PDFGate webhook signature against the raw request body.
 *
 * Implements the same algorithm as the PDFGate Node SDK (not yet published in
 * pdfgate@1.0.4). Header format: `t=<timestamp>,v1=<hex-signature>[,v1=...]`.
 * Tolerance window: 300 seconds.
 *
 * @throws {PdfGateSignatureVerificationError} If the signature is missing, expired, or invalid.
 */
export function verifySignature(
  secret: string,
  signatureHeader: string | undefined,
  payload: string,
): true {
  const parts = signatureHeader?.split(',').map((p) => p.trim()) ?? [];
  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx);
    const value = part.slice(eqIdx + 1);
    if (key === 't' && value) timestamp = Number(value);
    if (key === 'v1' && value) signatures.push(value);
  }

  if (!timestamp || Number.isNaN(timestamp)) {
    throw new PdfGateSignatureVerificationError('Missing timestamp');
  }
  if (signatures.length === 0) {
    throw new PdfGateSignatureVerificationError('Missing signature');
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    throw new PdfGateSignatureVerificationError('Signature expired');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  const isValid = signatures.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, 'hex');
      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  });

  if (!isValid) {
    throw new PdfGateSignatureVerificationError('Invalid signature');
  }

  return true;
}
