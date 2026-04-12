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
    const docs = [{ sourceDocumentId: 'doc_1', name: 'Contract', recipients: [{ email: 'a@b.com', name: 'Alice' }] }];
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: {
        requesterName: 'Acme Corp',
        documents: JSON.stringify(docs),
      },
    } as any;

    const result = await (createEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.createEnvelope).toHaveBeenCalledWith({
      requesterName: 'Acme Corp',
      documents: docs,
    });
    expect(result).toEqual(mockEnvelope);
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
