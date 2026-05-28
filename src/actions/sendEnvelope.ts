import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '69f5b65d131aa112dbssa',
  status: 'in_progress',
  documents: [
    {
      sourceDocumentId: '69f5b65d131aa112dbzzd',
      name: 'Sample Agreement.pdf',
      status: 'pending',
      recipients: [
        {
          email: 'recipient@example.com',
          name: 'Sample Recipient',
          status: 'pending',
          signingLink:
            'https://document-sandbox.pdfgate.com/sign/dfbdfbdbfjbfbdfbsdsfdsfdsfsdssd',
        },
      ],
    },
  ],
  createdAt: '2026-05-26T00:00:00.000Z',
};

export const sendEnvelope = {
  key: 'sendEnvelope',
  noun: 'Envelope',
  display: {
    label: 'Send Envelope',
    description: 'Send a signing envelope to its recipients.',
  },
  operation: {
    inputFields: [
      {
        key: 'envelopeId',
        label: 'Envelope ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of the envelope to send.',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      // pdfgate@1.0.4 types don't include sendEnvelope — cast until types are updated
      const client = getClient(bundle) as any;
      return withErrorHandling(z, () =>
        client.sendEnvelope({ id: bundle.inputData.envelopeId as string }),
      );
    },
    sample: SAMPLE,
  },
};
