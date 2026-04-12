import 'pdfgate';

declare module 'pdfgate' {
  export function verifySignature(secret: string, signatureHeader: string, rawBody: string): void;
  export class PdfGateSignatureVerificationError extends Error {
    constructor(message?: string);
  }
}
