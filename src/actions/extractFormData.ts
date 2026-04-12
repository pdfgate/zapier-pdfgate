import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

export const extractFormData = {
  key: 'extractFormData',
  noun: 'Form Data',
  display: {
    label: 'Extract PDF Form Data',
    description: 'Extract form field data from a fillable PDF and return it as a JSON object.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of the PDFGate document to extract form data from.',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.extractPdfFormData({ documentId: bundle.inputData.documentId }),
      );
    },
    sample: { fieldName: 'sampleValue' },
  },
};
