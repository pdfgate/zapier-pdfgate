import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: 'env_sample',
  status: 'created',
  documents: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const createEnvelope = {
  key: 'createEnvelope',
  noun: 'Envelope',
  display: {
    label: 'Create Envelope',
    description: 'Create a signing envelope from one or more existing PDFGate documents.',
  },
  operation: {
    inputFields: [
      {
        key: 'requesterName',
        label: 'Requester Name',
        type: 'string' as const,
        required: true,
        helpText: 'The name of the person or system creating the envelope.',
      },
      {
        key: 'documents',
        label: 'Documents (JSON)',
        type: 'text' as const,
        required: true,
        helpText:
          'JSON array of document objects. Each must have `sourceDocumentId`, `name`, and `recipients` (array of `{email, name, role?}`).\n\nExample:\n[{"sourceDocumentId":"doc_123","name":"Contract","recipients":[{"email":"alice@example.com","name":"Alice"}]}]',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      let documents: unknown;
      try {
        documents = JSON.parse(bundle.inputData.documents as string);
      } catch {
        throw new z.errors.Error('The "Documents" field must be a valid JSON array.');
      }

      const client = getClient(bundle) as any;
      return withErrorHandling(z, () =>
        client.createEnvelope({
          requesterName: bundle.inputData.requesterName as string,
          documents: documents as any,
        }),
      );
    },
    sample: SAMPLE,
  },
};
