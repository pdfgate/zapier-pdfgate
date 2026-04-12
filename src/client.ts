import { Bundle, ZObject } from 'zapier-platform-core';
import PdfGate from 'pdfgate';

export const getClient = (bundle: Bundle): PdfGate => {
  return new PdfGate(bundle.authData.apiKey as string);
};

export const withErrorHandling = async <T>(z: ZObject, fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (err: any) {
    if (err.status === 401 || (err.message && err.message.includes('401'))) {
      throw new z.errors.Error(
        'PDFGate authentication failed. Please reconnect your PDFGate account in Zapier.',
      );
    }
    throw new z.errors.Error(err.message ?? 'An error occurred with the PDFGate API.');
  }
};
