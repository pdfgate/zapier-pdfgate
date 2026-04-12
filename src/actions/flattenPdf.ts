import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: 'doc_sample_flat',
  status: 'completed',
  type: 'flattened',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const flattenPdf = {
  key: 'flattenPdf',
  noun: 'PDF',
  display: {
    label: 'Flatten PDF',
    description: 'Flatten an interactive PDF into a static, non-editable PDF.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of the PDFGate document to flatten.',
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () => client.flattenPdf(bundle.inputData as any));
    },
    sample: SAMPLE,
  },
};
