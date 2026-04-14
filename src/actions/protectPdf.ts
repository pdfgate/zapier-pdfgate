import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: 'doc_sample_prot',
  status: 'completed',
  type: 'encrypted',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const protectPdf = {
  key: 'protectPdf',
  noun: 'PDF',
  display: {
    label: 'Protect PDF',
    description: 'Encrypt a PDF with a password and optional permission restrictions.',
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
        key: 'algorithm',
        label: 'Encryption Algorithm',
        type: 'string' as const,
        required: false,
        choices: ['AES256', 'AES128'],
        helpText: 'Defaults to AES256.',
      },
      {
        key: 'userPin',
        label: 'User Password',
        type: 'string' as const,
        required: false,
        helpText: 'Password required to open the PDF.',
      },
      {
        key: 'ownerPin',
        label: 'Owner Password',
        type: 'string' as const,
        required: false,
        helpText: 'Full-control password. Required when using AES256 with a user password.',
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
        helpText: 'Whether to encrypt PDF metadata (default: false).',
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
      const { userPin, ownerPin, ...rest } = bundle.inputData as any;
      const params = {
        ...rest,
        ...(userPin !== undefined && { userPassword: userPin }),
        ...(ownerPin !== undefined && { ownerPassword: ownerPin }),
      };
      return withErrorHandling(z, () => client.protectPdf(params));
    },
    sample: SAMPLE,
  },
};
