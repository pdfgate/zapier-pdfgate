import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  status: 'completed',
  type: 'compressed',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

const buildCompressPdfRequest = (z: ZObject, inputData: Bundle['inputData']) => {
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
        helpText: 'ID of an existing PDFGate document.',
      },
      {
        key: 'linearize',
        label: 'Linearize',
        type: 'boolean' as const,
        required: false,
        helpText:
          'Makes the PDF load faster in the browser by letting pages appear before the whole file finishes downloading.',
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText:
          'Number of seconds the returned fileUrl remains valid. Allowed range: 60 to 86400 seconds.',
      },
      {
        key: 'metadata',
        label: 'Metadata',
        type: 'json' as const,
        required: false,
        helpText:
          'Optional metadata as JSON key-value pairs. Example: {"customerId":"123","invoiceId":"INV-001"}',
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.compressPdf(buildCompressPdfRequest(z, bundle.inputData) as any),
      );
    },
    sample: SAMPLE,
  },
};
