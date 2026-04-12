import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';

const SAMPLE = {
  event: 'envelope.expired',
  envelopeId: 'env_sample',
  status: 'expired',
};

export const envelopeExpired = {
  key: 'envelopeExpired',
  noun: 'Envelope',
  display: {
    label: 'Envelope Expired',
    description:
      'Triggers when a PDFGate envelope expires without all recipients signing. Set up: copy the webhook URL below and paste it in PDFGate Dashboard → Settings → Webhooks → Create.',
  },
  operation: {
    type: 'hook' as const,
    perform: (z: ZObject, bundle: Bundle) =>
      verifyAndFilter(z, bundle, 'envelope.expired'),
    sample: SAMPLE,
  },
};
