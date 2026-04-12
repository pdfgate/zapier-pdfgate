import { sendEnvelope } from '../../src/actions/sendEnvelope';
import { getClient } from '../../src/client';

jest.mock('../../src/client', () => ({
  ...jest.requireActual('../../src/client'),
  getClient: jest.fn(),
}));
const mockGetClient = getClient as jest.Mock;

const z = { errors: { Error: class extends Error {} } } as any;

const mockEnvelope = {
  id: 'env_123',
  status: 'in_progress',
  documents: [],
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('sendEnvelope action', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { sendEnvelope: jest.fn().mockResolvedValue(mockEnvelope) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls sendEnvelope with envelopeId mapped to id', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { envelopeId: 'env_123' },
    } as any;

    const result = await (sendEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.sendEnvelope).toHaveBeenCalledWith({ id: 'env_123' });
    expect(result).toEqual(mockEnvelope);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.sendEnvelope.mockRejectedValue(new Error('Not found'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { envelopeId: 'env_123' } } as any;

    await expect((sendEnvelope.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
