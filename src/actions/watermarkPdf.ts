import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  status: 'completed',
  type: 'watermarked',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-01-08T00:00:00.000Z',
};

const buildWatermarkPdfRequest = (z: ZObject, inputData: Bundle['inputData']) => {
  const request = { ...inputData, type: 'text' } as Record<string, any>;

  if (request.metadata === undefined || request.metadata === null || request.metadata === '') {
    delete request.metadata;
    return request;
  }

  if (typeof request.metadata === 'string') {
    try {
      request.metadata = JSON.parse(request.metadata);
    } catch {
      throw new z.errors.Error('The "metadata" field must be a valid JSON object.');
    }
  }

  if (typeof request.metadata !== 'object' || Array.isArray(request.metadata)) {
    throw new z.errors.Error('The "metadata" field must be a valid JSON object.');
  }

  return request;
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
        helpText: 'ID of an existing PDFGate document.',
      },
      {
        key: 'text',
        label: 'Watermark Text',
        type: 'string' as const,
        required: true,
        helpText: 'The text to overlay on the PDF as a watermark.',
      },
      {
        key: 'fontSize',
        label: 'Font Size (pt)',
        type: 'integer' as const,
        required: false,
        helpText: 'Text watermark font size in points.',
      },
      {
        key: 'fontColor',
        label: 'Font Color',
        type: 'string' as const,
        required: false,
        helpText: 'Text color as hex (e.g. #FF0000) or rgb (e.g. rgb(255,0,0)).',
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
        helpText: 'Set the watermark font.',
      },
      {
        key: 'opacity',
        label: 'Opacity',
        type: 'number' as const,
        required: false,
        helpText: 'Transparency from 0 (invisible) to 1 (opaque).',
      },
      {
        key: 'rotate',
        label: 'Rotation (degrees)',
        type: 'number' as const,
        required: false,
        helpText: 'Rotation angle of the watermark in degrees. Use a value between 0 and 360.',
      },
      {
        key: 'yPosition',
        label: 'Y Position (points)',
        type: 'integer' as const,
        required: false,
        helpText: 'Vertical position in points. If empty, watermark is centered vertically.',
      },
      {
        key: 'xPosition',
        label: 'X Position (points)',
        type: 'integer' as const,
        required: false,
        helpText: 'Horizontal position in points. If empty, watermark is centered horizontally.',
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText:
          'Number of seconds the returned fileUrl remains valid. Allowed range: 60 to 86400 seconds.',
      },
      {
        key: 'metadata',
        label: 'Metadata',
        type: 'json' as const,
        required: false,
        helpText:
          'Optional metadata as JSON key-value pairs. Example: {"customerId":"123","invoiceId":"INV-001"}',
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.watermarkPdf(buildWatermarkPdfRequest(z, bundle.inputData) as any),
      );
    },
    sample: SAMPLE,
  },
};
