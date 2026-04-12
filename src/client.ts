import { Bundle, ZObject } from 'zapier-platform-core';
import PdfGate from 'pdfgate';

export const getClient = (bundle: Bundle): PdfGate => {
  return new PdfGate(bundle.authData.apiKey as string);
};

export const withErrorHandling = async <T>(z: ZObject, fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (err: any) {
    throw new z.errors.Error(err.message ?? 'An error occurred with the PDFGate API.');
  }
};
