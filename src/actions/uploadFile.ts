import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE_DOCUMENT = {
  id: 'doc_sample456',
  status: 'completed',
  type: 'uploaded',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const uploadFile = {
  key: 'uploadFile',
  noun: 'File',
  display: {
    label: 'Upload File',
    description: 'Upload a PDF from a URL so it can be referenced by other PDFGate operations.',
  },
  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'File URL',
        type: 'string' as const,
        required: true,
        helpText: 'Public URL of the PDF file to upload.',
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Seconds until the file URL expires (min 60, max 86400).',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.uploadFile(bundle.inputData as any),
      );
    },
    sample: SAMPLE_DOCUMENT,
  },
};
