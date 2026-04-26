import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';
import { getWebhookSample, subscribeWebhook, unsubscribeWebhook } from '../webhooks';

const SAMPLE = {
  eventId: 'evt_sample',
  event: 'envelope.sent',
  resource: { kind: 'envelope', id: 'env_sample' },
  data: { envelope: { id: 'env_sample', status: 'in_progress', documents: [] } },
};

export const envelopeInProgress = {
  key: 'envelopeInProgress',
  noun: 'Envelope',
  display: {
    label: 'Envelope In Progress',
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
    performList: (z: ZObject, bundle: Bundle) =>
      getWebhookSample(z, bundle, 'envelope-sent-sample'),
    sample: SAMPLE,
  },
};
