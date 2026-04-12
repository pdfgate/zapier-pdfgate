import { getEnvelope } from '../../src/searches/getEnvelope';
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

describe('getEnvelope search', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = { getEnvelope: jest.fn().mockResolvedValue(mockEnvelope) };
    mockGetClient.mockReturnValue(mockClient);
  });

  it('calls getEnvelope with envelopeId mapped to id', async () => {
    const bundle = {
      authData: { apiKey: 'test_key' },
      inputData: { envelopeId: 'env_123' },
    } as any;

    const result = await (getEnvelope.operation.perform as Function)(z, bundle);

    expect(mockClient.getEnvelope).toHaveBeenCalledWith({ id: 'env_123' });
    expect(result).toEqual([mockEnvelope]);
  });

  it('rethrows API errors as z.errors.Error', async () => {
    mockClient.getEnvelope.mockRejectedValue(new Error('Not found'));
    const bundle = { authData: { apiKey: 'test_key' }, inputData: { envelopeId: 'env_123' } } as any;

    await expect((getEnvelope.operation.perform as Function)(z, bundle)).rejects.toBeInstanceOf(
      z.errors.Error,
    );
  });
});
