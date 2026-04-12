import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: 'doc_sample_comp',
  status: 'completed',
  type: 'compressed',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const compressPdf = {
  key: 'compressPdf',
  noun: 'PDF',
  display: {
    label: 'Compress PDF',
    description: 'Compress a PDF to reduce its file size without changing visual content.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of the PDFGate document to compress.',
      },
      {
        key: 'linearize',
        label: 'Linearize',
        type: 'boolean' as const,
        required: false,
        helpText: 'Optimize for fast web viewing (first page renders sooner).',
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
      return withErrorHandling(z, () => client.compressPdf(bundle.inputData as any));
    },
    sample: SAMPLE,
  },
};
