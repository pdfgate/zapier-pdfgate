import { createEnvelope } from '../../src/actions/createEnvelope';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockEnvelope = {
  id: 'env_123',
  status: 'created',
  documents: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('createEnvelope action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { createEnvelope: jest.fn().mockResolvedValue(mockEnvelope) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('parses documents JSON and calls createEnvelope', async () => {
    const docs = [
      {
        sourceDocumentId: 'doc_1',
        name: 'Contract',
        recipients: [
          {
            email: 'a@b.com',
            name: 'Alice',
            role: 'signer',
            reminderIntervalDays: 2,
            reminderAttempts: 3,
          },
        ],
      },
    ];
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme Corp',
        documents: JSON.stringify(docs),
        metadata: '{"source":"zapier"}',
      },
    } as any;

    const result = await (createEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.createEnvelope).toHaveBeenCalledWith({
      requesterName: 'Acme Corp',
      documents: docs,
      metadata: { source: 'zapier' },
    });
    expect(result).toEqual(mockEnvelope);
  });

  it('accepts documents as an already parsed JSON array', async () => {
    const docs = [
      {
        sourceDocumentId: 'doc_1',
        name: 'Contract',
        recipients: [{ email: 'a@b.com', name: 'Alice' }],
      },
    ];
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme Corp',
        documents: docs,
      },
    } as any;

    await (createEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.createEnvelope).toHaveBeenCalledWith({
      requesterName: 'Acme Corp',
      documents: docs,
    });
  });

  it('builds documents from nested Zapier document and recipient line-item fields', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme Corp',
        documents: [
          {
            sourceDocumentId: 'doc_1',
            documentName: 'Contract.pdf',
            recipients: [
              {
                email: 'alice@example.com',
                name: 'Alice',
                role: 'signer',
                reminderIntervalDays: 2,
                reminderAttempts: 3,
              },
              {
                email: 'bob@example.com',
                name: 'Bob',
              },
            ],
          },
        ],
      },
    } as any;

    await (createEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.createEnvelope).toHaveBeenCalledWith({
      requesterName: 'Acme Corp',
      documents: [
        {
          sourceDocumentId: 'doc_1',
          name: 'Contract.pdf',
          recipients: [
            {
              email: 'alice@example.com',
              name: 'Alice',
              role: 'signer',
              reminderIntervalDays: 2,
              reminderAttempts: 3,
            },
            {
              email: 'bob@example.com',
              name: 'Bob',
            },
          ],
        },
      ],
    });
  });

  it('builds documents from numbered recipient fields', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme Corp',
        documents: [
          {
            sourceDocumentId: 'doc_1',
            documentName: 'Contract.pdf',
            reminderIntervalDays: 2,
            reminderAttempts: 3,
            recipient1Email: 'alice@example.com',
            recipient1Name: 'Alice',
            recipient1Role: 'signer',
            recipient2Email: 'bob@example.com',
            recipient2Name: 'Bob',
          },
        ],
      },
    } as any;

    await (createEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.createEnvelope).toHaveBeenCalledWith({
      requesterName: 'Acme Corp',
      documents: [
        {
          sourceDocumentId: 'doc_1',
          name: 'Contract.pdf',
          recipients: [
            {
              email: 'alice@example.com',
              name: 'Alice',
              role: 'signer',
              reminderIntervalDays: 2,
              reminderAttempts: 3,
            },
            {
              email: 'bob@example.com',
              name: 'Bob',
              reminderIntervalDays: 2,
              reminderAttempts: 3,
            },
          ],
        },
      ],
    });
  });

  it('continues to build documents from flat Zapier line-item fields', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme Corp',
        documents: [
          {
            sourceDocumentId: 'doc_1',
            documentName: 'Contract.pdf',
            recipientEmail: 'alice@example.com',
            recipientName: 'Alice',
          },
          {
            sourceDocumentId: 'doc_1',
            documentName: 'Contract.pdf',
            recipientEmail: 'bob@example.com',
            recipientName: 'Bob',
          },
        ],
      },
    } as any;

    await (createEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.createEnvelope).toHaveBeenCalledWith({
      requesterName: 'Acme Corp',
      documents: [
        {
          sourceDocumentId: 'doc_1',
          name: 'Contract.pdf',
          recipients: [
            {
              email: 'alice@example.com',
              name: 'Alice',
            },
            {
              email: 'bob@example.com',
              name: 'Bob',
            },
          ],
        },
      ],
    });
  });

  it('throws z.errors.Error when documents is invalid JSON', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { requesterName: 'Acme', documents: 'not-json' },
    } as any;

    await expect((createEnvelope.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });

  it('throws z.errors.Error when documents is not an array', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { requesterName: 'Acme', documents: '{"key":"value"}' },
    } as any;

    await expect((createEnvelope.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });

  it('throws z.errors.Error when metadata is invalid JSON', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme',
        documents: '[]',
        metadata: 'not-json',
      },
    } as any;

    await expect((createEnvelope.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.createEnvelope.mockRejectedValue(new Error('Bad request'));
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { requesterName: 'Acme', documents: '[]' },
    } as any;

    await expect((createEnvelope.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
