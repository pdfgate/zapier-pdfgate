import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';
import { getWebhookSample, subscribeWebhook, unsubscribeWebhook } from '../webhooks';

const SAMPLE = {
  eventId: 'evt_sample',
  event: 'envelope.expired',
  resource: { kind: 'envelope', id: 'env_sample' },
  data: { envelope: { id: 'env_sample', status: 'expired', documents: [] } },
};

export const envelopeExpired = {
  key: 'envelopeExpired',
  noun: 'Envelope',
  display: {
    label: 'Envelope Expired',
    description:
      'Triggers when a PDFGate envelope expires without all recipients signing.',
  },
  operation: {
    type: 'hook' as const,
    performSubscribe: (z: ZObject, bundle: Bundle) =>
      subscribeWebhook(z, bundle, ['envelope.expired']),
    performUnsubscribe: unsubscribeWebhook,
    perform: (z: ZObject, bundle: Bundle) =>
      verifyAndFilter(z, bundle, 'envelope.expired'),
    performList: (z: ZObject, bundle: Bundle) =>
      getWebhookSample(z, bundle, 'envelope-expired-sample'),
    sample: SAMPLE,
  },
};
