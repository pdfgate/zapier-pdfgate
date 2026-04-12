import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: 'doc_sample_wm',
  status: 'completed',
  type: 'watermarked',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

export const watermarkPdf = {
  key: 'watermarkPdf',
  noun: 'PDF',
  display: {
    label: 'Watermark PDF',
    description: 'Apply a text watermark to a PDF.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
      },
      {
        key: 'text',
        label: 'Watermark Text',
        type: 'string' as const,
        required: true,
        helpText: 'The text to stamp on the PDF (e.g. "CONFIDENTIAL").',
      },
      {
        key: 'font',
        label: 'Font',
        type: 'string' as const,
        required: false,
        choices: [
          'times-roman', 'times-bold', 'times-italic', 'times-bolditalic',
          'helvetica', 'helvetica-bold', 'helvetica-oblique', 'helvetica-boldoblique',
          'courier', 'courier-bold', 'courier-oblique', 'courier-boldoblique',
        ],
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        type: 'integer' as const,
        required: false,
      },
      {
        key: 'fontColor',
        label: 'Font Color',
        type: 'string' as const,
        required: false,
        helpText: 'CSS color value (e.g. "#FF0000" or "red").',
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'number' as const,
        required: false,
        helpText: 'Value between 0 and 1.',
      },
      {
        key: 'xPosition',
        label: 'X Position',
        type: 'integer' as const,
        required: false,
      },
      {
        key: 'yPosition',
        label: 'Y Position',
        type: 'integer' as const,
        required: false,
      },
      {
        key: 'rotate',
        label: 'Rotation (degrees)',
        type: 'number' as const,
        required: false,
        helpText: 'Value between 0 and 360.',
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.watermarkPdf({ ...bundle.inputData, type: 'text' } as any),
      );
    },
    sample: SAMPLE,
  },
};
