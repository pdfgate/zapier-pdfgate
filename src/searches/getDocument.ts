import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: 'doc_sample',
  status: 'completed',
  type: 'from_html',
  fileUrl: 'https://example.com/sample.pdf',
  size: 102400,
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const getDocument = {
  key: 'getDocument',
  noun: 'Document',
  display: {
    label: 'Get Document',
    description: 'Retrieve a PDFGate document by ID.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Generate a fresh download URL expiring in this many seconds (min 60, max 86400).',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      const result = await withErrorHandling(z, () =>
        client.getDocument({
          id: bundle.inputData.documentId as string,
          preSignedUrlExpiresIn: bundle.inputData.preSignedUrlExpiresIn as number | undefined,
        }),
      );
      return [result];
    },
    sample: SAMPLE,
  },
};
