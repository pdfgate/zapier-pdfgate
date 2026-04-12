import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';

const SAMPLE = {
  event: 'envelope.completed',
  envelopeId: 'env_sample',
  status: 'completed',
};

export const envelopeCompleted = {
  key: 'envelopeCompleted',
  noun: 'Envelope',
  display: {
    label: 'Envelope Completed',
    description:
      'Triggers when all recipients have signed a PDFGate envelope. Set up: copy the webhook URL below and paste it in PDFGate Dashboard → Settings → Webhooks → Create.',
  },
  operation: {
    type: 'hook' as const,
    perform: (z: ZObject, bundle: Bundle) =>
      verifyAndFilter(z, bundle, 'envelope.completed'),
    sample: SAMPLE,
  },
};
