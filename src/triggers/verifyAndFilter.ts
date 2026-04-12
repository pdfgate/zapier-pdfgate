import { Bundle, ZObject } from 'zapier-platform-core';
import { verifySignature, PdfGateSignatureVerificationError } from '../lib/webhookVerification';

export const verifyAndFilter = async (
  z: ZObject,
  bundle: Bundle,
  eventType: string,
): Promise<object[]> => {
  const secret = bundle.authData.webhookSecret as string;
  const signatureHeader = (bundle.rawRequest?.headers?.['x-pdfgate-signature'] as string) ?? '';
  const rawBody = (bundle.rawRequest?.content as string) ?? '';

  try {
    verifySignature(secret, signatureHeader, rawBody);
  } catch (err) {
    if (err instanceof PdfGateSignatureVerificationError) {
      throw new z.errors.Error(`Webhook signature verification failed: ${err.message}`);
    }
    throw err;
  }

  const data = bundle.cleanedRequest?.data as { event?: string } | undefined;
  if (!data || data.event !== eventType) return [];
  return [data];
};
