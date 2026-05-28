import { Bundle, ZObject } from 'zapier-platform-core';

export const verifyAndFilter = async (
  z: ZObject,
  bundle: Bundle,
  eventType: string,
): Promise<object[]> => {
  const data = bundle.cleanedRequest;

  if (!data || data.event !== eventType) return [];
  return [data];
};
