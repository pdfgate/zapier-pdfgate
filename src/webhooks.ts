import { Bundle, ZObject } from 'zapier-platform-core';

const getApiBaseUrl = (apiKey: string): string => {
  return apiKey.startsWith('test_')
    ? 'https://api-sandbox.pdfgate.com'
    : 'https://api.pdfgate.com';
};

export const subscribeWebhook = async (
  z: ZObject,
  bundle: Bundle,
  eventTypes: string[],
): Promise<{ id: string; secret: string }> => {
  const apiKey = bundle.authData.apiKey as string;
  const response = await z.request({
    url: `${getApiBaseUrl(apiKey)}/webhook`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: bundle.targetUrl,
      eventTypes,
    }),
  });

  return {
    id: response.data.id,
    secret: response.data.secret,
  };
};

export const unsubscribeWebhook = async (
  z: ZObject,
  bundle: Bundle,
): Promise<{ success: boolean }> => {
  const apiKey = bundle.authData.apiKey as string;
  const subscribeData = bundle.subscribeData as { id?: string } | undefined;
  if (!subscribeData?.id) return { success: true };

  await z.request({
    url: `${getApiBaseUrl(apiKey)}/webhook/${subscribeData.id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return { success: true };
};

export const getWebhookSample = async (
  z: ZObject,
  bundle: Bundle,
  samplePath: string,
  fallbackSample?: object,
  expectedEvent?: string,
): Promise<object[]> => {
  const apiKey = bundle.authData.apiKey as string;
  try {
    const response = await z.request({
      url: `${getApiBaseUrl(apiKey)}/webhook/${samplePath}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (
      response.data &&
      (!expectedEvent || response.data.event === expectedEvent) &&
      response.data.data?.envelope?.id
    ) {
      return [response.data];
    }

    if (!fallbackSample && !expectedEvent) {
      return [response.data];
    }

    if (!fallbackSample) {
      throw new z.errors.Error(
        `The ${samplePath} endpoint returned an invalid sample for this account.`,
      );
    }
  } catch {
    if (!fallbackSample) {
      throw new z.errors.Error(
        `Could not load a valid ${samplePath} sample for this account.`,
      );
    }
  }

  return fallbackSample ? [fallbackSample] : [];
};
