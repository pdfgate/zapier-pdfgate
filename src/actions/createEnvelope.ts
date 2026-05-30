import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE = {
  id: '69f5b65d131aa112dbssa',
  status: 'created',
  documents: [
    {
      sourceDocumentId: '69f5b65d131aa112dbzzd',
      name: 'Sample Agreement.pdf',
      status: 'created',
      recipients: [
        {
          email: 'recipient@example.com',
          name: 'Sample Recipient',
          status: 'created',
        },
      ],
    },
  ],
  createdAt: '2026-05-26T00:00:00.000Z',
};

const normalizeRecipient = (recipient: Record<string, any>) => ({
  email: recipient.email ?? recipient.recipientEmail,
  name: recipient.name ?? recipient.recipientName,
  ...(recipient.role !== undefined && recipient.role !== '' && {
    role: recipient.role,
  }),
  ...(recipient.recipientRole !== undefined && recipient.recipientRole !== '' && {
    role: recipient.recipientRole,
  }),
  ...(recipient.reminderIntervalDays !== undefined && {
    reminderIntervalDays: recipient.reminderIntervalDays,
  }),
  ...(recipient.reminderAttempts !== undefined && {
    reminderAttempts: recipient.reminderAttempts,
  }),
});

const normalizeNestedLineItemDocuments = (documents: Record<string, any>[]) =>
  documents.map((document) => ({
    sourceDocumentId: document.sourceDocumentId,
    name: document.name ?? document.documentName,
    recipients: (document.recipients as Record<string, any>[]).map(normalizeRecipient),
  }));

const maybeBuildNumberedRecipient = (document: Record<string, any>, index: number) => {
  const email = document[`recipient${index}Email`];
  const name = document[`recipient${index}Name`];

  if ((email === undefined || email === '') && (name === undefined || name === '')) {
    return undefined;
  }

  return {
    email,
    name,
    ...(document[`recipient${index}Role`] !== undefined &&
      document[`recipient${index}Role`] !== '' && {
        role: document[`recipient${index}Role`],
      }),
    ...(document.reminderIntervalDays !== undefined && {
      reminderIntervalDays: document.reminderIntervalDays,
    }),
    ...(document.reminderAttempts !== undefined && {
      reminderAttempts: document.reminderAttempts,
    }),
  };
};

const normalizeNumberedRecipientDocuments = (documents: Record<string, any>[]) =>
  documents.map((document) => ({
    sourceDocumentId: document.sourceDocumentId,
    name: document.documentName,
    recipients: [1, 2, 3, 4]
      .map((index) => maybeBuildNumberedRecipient(document, index))
      .filter(Boolean),
  }));

const normalizeLineItemDocuments = (documents: Record<string, any>[]) => {
  const documentsByKey = new Map<string, any>();

  for (const document of documents) {
    const sourceDocumentId = document.sourceDocumentId;
    const name = document.documentName;
    const key = `${sourceDocumentId}:${name}`;

    if (!documentsByKey.has(key)) {
      documentsByKey.set(key, {
        sourceDocumentId,
        name,
        recipients: [],
      });
    }

    documentsByKey.get(key).recipients.push(normalizeRecipient(document));
  }

  return Array.from(documentsByKey.values());
};

const normalizeDocuments = (z: ZObject, inputData: Bundle['inputData']) => {
  let documents = inputData.documents as unknown;

  if (typeof documents === 'string') {
    try {
      documents = JSON.parse(documents);
    } catch {
      throw new z.errors.Error('The "Documents" field must be a valid JSON array.');
    }
  }

  if (!Array.isArray(documents)) {
    throw new z.errors.Error('The "Documents" field must be a valid JSON array.');
  }

  if (
    documents.every(
      (document) =>
        typeof document === 'object' &&
        document !== null &&
        'recipients' in document &&
        'name' in document,
    )
  ) {
    return documents;
  }

  if (
    documents.every(
      (document) =>
        typeof document === 'object' &&
        document !== null &&
        'recipients' in document &&
        Array.isArray((document as Record<string, any>).recipients),
    )
  ) {
    return normalizeNestedLineItemDocuments(documents as Record<string, any>[]);
  }

  if (
    documents.every(
      (document) =>
        typeof document === 'object' &&
        document !== null &&
        'recipient1Email' in document,
    )
  ) {
    return normalizeNumberedRecipientDocuments(documents as Record<string, any>[]);
  }

  return normalizeLineItemDocuments(documents as Record<string, any>[]);
};

const buildCreateEnvelopeRequest = (z: ZObject, inputData: Bundle['inputData']) => {
  const documents = normalizeDocuments(z, inputData);

  const request = {
    requesterName: inputData.requesterName as string,
    documents,
  } as Record<string, any>;

  if (inputData.metadata === undefined || inputData.metadata === null || inputData.metadata === '') {
    return request;
  }

  request.metadata = inputData.metadata;

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

export const createEnvelope = {
  key: 'createEnvelope',
  noun: 'Envelope',
  display: {
    label: 'Create Envelope',
    description: 'Create a signing envelope from one or more existing PDFGate documents.',
  },
  operation: {
    inputFields: [
      {
        key: 'requesterName',
        label: 'Requester Name',
        type: 'string' as const,
        required: true,
        helpText: 'The name of the person or system creating the envelope.',
      },
      {
        key: 'documentsInstructions',
        label: 'Documents Instructions',
        type: 'copy' as const,
        helpText:
          'Provide the document to include in the envelope. Recipient 1 is required. Recipients 2-4 are optional.',
      },
      {
        key: 'documents',
        label: 'Documents',
        required: true,
        children: [
          {
            key: 'sourceDocumentId',
            label: 'Source Document ID',
            type: 'string' as const,
            required: true,
            helpText: 'ID of an existing PDFGate document. You can map this from a previous step.',
          },
          {
            key: 'documentName',
            label: 'Document Name',
            type: 'string' as const,
            required: true,
            helpText: 'Name of the document inside the envelope.',
          },
          {
            key: 'recipient1Email',
            label: 'Recipient 1 Email',
            type: 'string' as const,
            required: true,
            helpText: 'Recipient email address.',
          },
          {
            key: 'recipient1Name',
            label: 'Recipient 1 Name',
            type: 'string' as const,
            required: true,
            helpText: 'Recipient name.',
          },
          {
            key: 'recipient1Role',
            label: 'Recipient 1 Role',
            type: 'string' as const,
            required: false,
            helpText: 'Role assigned to the recipient.',
          },
          {
            key: 'reminderIntervalDays',
            label: 'Reminder Interval Days',
            type: 'number' as const,
            required: false,
            helpText:
              'Number of days between signing reminder emails for all recipients on this document. Leave blank for the default of 2 days, or set to 0 to disable reminders.',
          },
          {
            key: 'reminderAttempts',
            label: 'Reminder Attempts',
            type: 'number' as const,
            required: false,
            helpText:
              'Maximum number of reminder emails to send to each recipient on this document while the envelope is active.',
          },
          {
            key: 'recipient2Email',
            label: 'Recipient 2 Email',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient2Name',
            label: 'Recipient 2 Name',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient2Role',
            label: 'Recipient 2 Role',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient3Email',
            label: 'Recipient 3 Email',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient3Name',
            label: 'Recipient 3 Name',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient3Role',
            label: 'Recipient 3 Role',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient4Email',
            label: 'Recipient 4 Email',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient4Name',
            label: 'Recipient 4 Name',
            type: 'string' as const,
            required: false,
          },
          {
            key: 'recipient4Role',
            label: 'Recipient 4 Role',
            type: 'string' as const,
            required: false,
          },
        ],
      },
      {
        key: 'metadata',
        label: 'Metadata (JSON)',
        type: 'json' as const,
        required: false,
        helpText: 'Custom data to store on the envelope record.',
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      // pdfgate@1.0.4 types don't include createEnvelope — cast until types are updated
      const client = getClient(bundle) as any;
      return withErrorHandling(z, () =>
        client.createEnvelope(buildCreateEnvelopeRequest(z, bundle.inputData)),
      );
    },
    sample: SAMPLE,
  },
};
