import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE_DOCUMENT = {
  id: 'doc_sample123',
  status: 'completed',
  type: 'from_html',
  fileUrl: 'https://example.com/sample.pdf',
  size: 102400,
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const generatePdf = {
  key: 'generatePdf',
  noun: 'PDF',
  display: {
    label: 'Generate PDF',
    description: 'Generate a PDF from a URL or raw HTML.',
  },
  operation: {
    inputFields: [
      {
        key: 'url',
        label: 'URL',
        type: 'string' as const,
        helpText: 'The URL to render as a PDF. Provide either this or HTML.',
      },
      {
        key: 'html',
        label: 'HTML',
        type: 'text' as const,
        helpText: 'Raw HTML to render as a PDF. Provide either this or URL.',
      },
      {
        key: 'pageSizeType',
        label: 'Page Size',
        type: 'string' as const,
        required: false,
        choices: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'ledger', 'tabloid', 'legal', 'letter'],
      },
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'string' as const,
        required: false,
        choices: ['portrait', 'landscape'],
      },
      {
        key: 'printBackground',
        label: 'Print Background',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'waitForNetworkIdle',
        label: 'Wait for Network Idle',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Seconds until the file URL expires (min 60, max 86400).',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.generatePdf(bundle.inputData as any),
      );
    },
    sample: SAMPLE_DOCUMENT,
  },
};
