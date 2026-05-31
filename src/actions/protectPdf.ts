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
        helpText: 'ID of an existing PDFGate document to encrypt.',
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
        key: 'algorithm',
        label: 'Encryption Algorithm',
        type: 'string' as const,
        required: false,
        choices: ['AES256', 'AES128'],
        helpText: 'Options: AES-256 (strongest), AES-128 (better compatibility with older readers).',
      },
      {
        key: 'userAccessCode',
        label: 'User Password',
        type: 'string' as const,
        required: false,
        helpText: 'Password required to open the PDF. If empty, the document opens without a password.',
      },
      {
        key: 'ownerAccessCode',
        label: 'Owner Password',
        type: 'string' as const,
        required: false,
        helpText:
          'Password that grants full control (modifying permissions, removing restrictions).',
      },
      {
        key: 'disableEditing',
        label: 'Disable Editing',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, prevents form edits and annotation changes.',
      },
      {
        key: 'disableCopy',
        label: 'Disable Copy/Extract',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, blocks copying text or extracting images.',
      },
      {
        key: 'disablePrint',
        label: 'Disable Printing',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, the PDF cannot be printed.',
      },
      {
        key: 'encryptMetadata',
        label: 'Encrypt Metadata',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, the document title/author/keywords are encrypted along with content.',
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
        client.protectPdf(buildProtectPdfRequest(z, bundle.inputData)),
      );
    },
    sample: SAMPLE,
  },
};
