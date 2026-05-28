import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';
import { subscribeWebhook, unsubscribeWebhook } from '../webhooks';

const SAMPLE = {
  eventId: '6a16a190a914f69e7062798a',
  event: 'envelope.sent',
  timestamp: '2026-05-26T00:00:00.000Z',
  resource: {
    kind: 'envelope',
    id: '6a16a11fa914f69e70627956',
  },
  data: {
    envelope: {
      id: '6a16a11fa914f69e70627956',
      status: 'in_progress',
      documents: [
        {
          sourceDocumentId: '6a15451ccc2398445d216ab5',
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
    },
  },
};

export const envelopeSent = {
  key: 'envelopeSent',
  noun: 'Envelope',
  display: {
    label: 'Envelope Sent',
    description:
      'Triggers when a PDFGate envelope is sent to recipients and signing has begun.',
  },
  operation: {
    type: 'hook' as const,
    performSubscribe: (z: ZObject, bundle: Bundle) =>
      subscribeWebhook(z, bundle, ['envelope.sent']),
    performUnsubscribe: unsubscribeWebhook,
    perform: (z: ZObject, bundle: Bundle) =>
      verifyAndFilter(z, bundle, 'envelope.sent'),
    performList: () => [SAMPLE],
    sample: SAMPLE,
  },
};
