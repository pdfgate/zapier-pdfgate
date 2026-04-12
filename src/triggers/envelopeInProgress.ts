import { Bundle, ZObject } from 'zapier-platform-core';
import { verifyAndFilter } from './verifyAndFilter';

const SAMPLE = {
  event: 'envelope.in_progress',
  envelopeId: 'env_sample',
  status: 'in_progress',
};

export const envelopeInProgress = {
  key: 'envelopeInProgress',
  noun: 'Envelope',
  display: {
    label: 'Envelope In Progress',
    description:
      'Triggers when a PDFGate envelope is sent to recipients and signing has begun. Set up: copy the webhook URL below and paste it in PDFGate Dashboard → Settings → Webhooks → Create.',
  },
  operation: {
    type: 'hook' as const,
    perform: (z: ZObject, bundle: Bundle) =>
      verifyAndFilter(z, bundle, 'envelope.in_progress'),
    sample: SAMPLE,
  },
};
