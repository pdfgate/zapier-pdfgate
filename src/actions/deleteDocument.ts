import { Bundle, ZObject } from 'zapier-platform-core';
import { withErrorHandling } from '../client';
import { getApiBaseUrl } from '../webhooks';

const SAMPLE = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  deleted: true,
};

export const deleteDocument = {
  key: 'deleteDocument',
  noun: 'Document',
  display: {
    label: 'Delete Document',
    description: 'Delete a stored PDFGate document by ID.',
  },
  operation: {
    inputFields: [
      {
        key: 'documentId',
        label: 'Document ID',
        type: 'string' as const,
        required: true,
        helpText: 'The ID of the document to delete.',
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const apiKey = bundle.authData.apiKey as string;
      const documentId = bundle.inputData.documentId as string;

      return withErrorHandling(z, async () => {
        const response = await z.request({
          url: `${getApiBaseUrl(apiKey)}/document/${documentId}`,
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        return response.data ?? { id: documentId, deleted: true };
      });
    },
    sample: SAMPLE,
  },
};
