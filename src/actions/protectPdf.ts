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
        key: 'userPassword',
        label: 'User Password',
        type: 'password' as const,
        required: false,
        helpText: 'Password required to open the PDF.',
      },
      {
        key: 'ownerPassword',
        label: 'Owner Password',
        type: 'password' as const,
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
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () => client.protectPdf(bundle.inputData as any));
    },
    sample: SAMPLE,
  },
};
