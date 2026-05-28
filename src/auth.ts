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

const connectionLabel = (z: ZObject, bundle: Bundle): string => {
  const apiKey = bundle.authData.apiKey as string | undefined;
  if (apiKey?.startsWith('live_')) {
    return 'PDFGate Production Account';
  }
  if (apiKey?.startsWith('test_')) {
    return 'PDFGate Sandbox Account';
  }
  return 'PDFGate Account';
};

export const authentication = {
  type: 'custom' as const,
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string' as const,
      helpText:
        'Your PDFGate API key. Must start with `test_` (sandbox) or `live_` (production). You can create one from the Settings page in your PDFGate dashboard. See the [PDFGate API documentation](https://pdfgate.com/documentation).',
    },
  ],
  test,
  connectionLabel,
};
