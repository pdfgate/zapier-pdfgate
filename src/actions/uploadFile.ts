import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE_DOCUMENT = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  status: 'completed',
  type: 'uploaded',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

const buildUploadFileRequest = (z: ZObject, inputData: Bundle['inputData']) => {
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
        client.uploadFile(buildUploadFileRequest(z, bundle.inputData) as any),
      );
    },
    sample: SAMPLE_DOCUMENT,
  },
};
