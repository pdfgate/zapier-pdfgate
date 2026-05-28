import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  status: 'completed',
  type: 'encrypted',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

const buildProtectPdfRequest = (z: ZObject, inputData: Bundle['inputData']) => {
  const { userAccessCode, ownerAccessCode, userPin, ownerPin, ...request } = inputData as any;

  if (request.userPassword === undefined && userAccessCode !== undefined) {
    request.userPassword = userAccessCode;
  }

  if (request.userPassword === undefined && userPin !== undefined) {
    request.userPassword = userPin;
  }

  if (request.ownerPassword === undefined && ownerAccessCode !== undefined) {
    request.ownerPassword = ownerAccessCode;
  }

  if (request.ownerPassword === undefined && ownerPin !== undefined) {
    request.ownerPassword = ownerPin;
  }

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

export const protectPdf = {
  key: 'protectPdf',
  noun: 'PDF',
  display: {
    label: 'Protect PDF',
    description: 'Encrypt a PDF and optionally apply permission restrictions.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of an already uploaded file stored on PDFGate.',
      },
      {
        key: 'algorithm',
        label: 'Encryption Algorithm',
        type: 'string' as const,
        required: false,
        choices: ['AES256', 'AES128'],
        helpText: 'Defaults to AES256.',
      },
      {
        key: 'userAccessCode',
        label: 'Open PDF Code',
        type: 'string' as const,
        required: false,
        helpText: 'Code required to open the PDF.',
      },
      {
        key: 'ownerAccessCode',
        label: 'Owner Control Code',
        type: 'string' as const,
        required: false,
        helpText: 'Code that grants full control over the PDF permissions.',
      },
      {
        key: 'disablePrint',
        label: 'Disable Printing',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'disableCopy',
        label: 'Disable Copying',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'disableEditing',
        label: 'Disable Editing',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'encryptMetadata',
        label: 'Encrypt Metadata',
        type: 'boolean' as const,
        required: false,
        helpText: 'Encrypt PDF metadata (default: false).',
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
        client.protectPdf(buildProtectPdfRequest(z, bundle.inputData)),
      );
    },
    sample: SAMPLE,
  },
};
