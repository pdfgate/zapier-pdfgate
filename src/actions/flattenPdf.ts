import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  status: 'completed',
  type: 'flattened',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

const buildFlattenPdfRequest = (z: ZObject, inputData: Bundle['inputData']) => {
  const request = { ...inputData };

  if (request.metadata === undefined || request.metadata === null || request.metadata === '') {
    delete request.metadata;
    return request;
  }

  if (typeof request.metadata === 'string') {
    try {
      request.metadata = JSON.parse(request.metadata);
    } catch {
      throw new z.errors.Error('The "metadata" field must be a valid JSON object.');
    }
  }

  if (typeof request.metadata !== 'object' || Array.isArray(request.metadata)) {
    throw new z.errors.Error('The "metadata" field must be a valid JSON object.');
  }

  return request;
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
      {
        key: 'metadata',
        label: 'Metadata (JSON)',
        type: 'json' as const,
        required: false,
        helpText: 'Custom data to store on the document record.',
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.flattenPdf(buildFlattenPdfRequest(z, bundle.inputData) as any),
      );
    },
    sample: SAMPLE,
  },
};
