import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';
import { getWebhookSample, subscribeWebhook, unsubscribeWebhook } from '../webhooks';

const SAMPLE = {
  eventId: 'evt_sample',
  event: 'envelope.completed',
  resource: { kind: 'envelope', id: 'env_sample' },
  data: { envelope: { id: 'env_sample', status: 'completed', documents: [] } },
};

export const envelopeCompleted = {
  key: 'envelopeCompleted',
  noun: 'Envelope',
  display: {
    label: 'Envelope Completed',
    description:
      'Triggers when all recipients have signed a PDFGate envelope.',
  },
  operation: {
    type: 'hook' as const,
    performSubscribe: (z: ZObject, bundle: Bundle) =>
      subscribeWebhook(z, bundle, ['envelope.completed']),
    performUnsubscribe: unsubscribeWebhook,
    perform: (z: ZObject, bundle: Bundle) =>
      verifyAndFilter(z, bundle, 'envelope.completed'),
    performList: (z: ZObject, bundle: Bundle) =>
      getWebhookSample(z, bundle, 'envelope-completed-sample'),
    sample: SAMPLE,
  },
};
