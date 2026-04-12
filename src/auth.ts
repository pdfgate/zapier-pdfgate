import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient } from './client';

const test = async (z: ZObject, bundle: Bundle): Promise<void> => {
  const client = getClient(bundle);
  try {
    await client.getDocument({ id: 'auth-test' });
  } catch (err: any) {
    if (err.status === 401 || (err.message && err.message.includes('401'))) {
      throw new z.errors.Error('Invalid PDFGate API key.');
    }
    // 404 = key is valid, document just doesn't exist — this is expected
  }
};

export const authentication = {
  type: 'custom' as const,
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string' as const,
      helpText: 'Your PDFGate API key. Must start with `test_` (sandbox) or `live_` (production).',
    },
    {
      key: 'webhookSecret',
      label: 'Webhook Secret',
      required: false,
      type: 'string' as const,
      helpText:
        'Your PDFGate webhook signing secret. Required for envelope triggers. Find it in PDFGate Dashboard → Settings → Webhooks.',
    },
  ],
  test,
  connectionLabel: '{{bundle.authData.apiKey}}',
};
