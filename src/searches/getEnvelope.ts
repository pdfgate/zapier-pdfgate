import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '69f5b65d131aa112dbssa',
  status: 'created',
  documents: [
    {
      sourceDocumentId: '69f5b65d131aa112dbzzd',
      name: 'Sample Agreement.pdf',
      status: 'created',
      recipients: [
        {
          email: 'recipient@example.com',
          name: 'Sample Recipient',
          status: 'created',
        },
      ],
    },
  ],
  createdAt: '2026-05-26T00:00:00.000Z',
};

export const getEnvelope = {
  key: 'getEnvelope',
  noun: 'Envelope',
  display: {
    label: 'Get Envelope',
    description: 'Retrieve a PDFGate envelope by ID.',
  },
  operation: {
    inputFields: [
      {
        key: 'envelopeId',
        label: 'Envelope ID',
        type: 'string' as const,
        required: true,
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      // pdfgate npm types don't include getEnvelope yet — cast until types are updated
      const client = getClient(bundle) as any;
      const result = await withErrorHandling(z, () =>
        client.getEnvelope({ id: bundle.inputData.envelopeId as string }),
      );
      return [result];
    },
    sample: SAMPLE,
  },
};
