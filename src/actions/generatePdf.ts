import { Bundle, ZObject } from 'zapier-platform-core';
import { getClient, withErrorHandling } from '../client';

const SAMPLE_DOCUMENT = {
  id: '6a12d80d8ce4ed8f2d3e5b86',
  status: 'completed',
  type: 'from_html',
  fileUrl: 'https://api.pdfgate.com/file/open/dfdgd_token',
  size: 102400,
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-02-01T00:00:00.000Z',
};

const JSON_OBJECT_FIELDS = [
  'clickSelectorChainSetup',
  'metadata',
];

const parseJsonObjectField = (z: ZObject, key: string, value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      throw new z.errors.Error(`The "${key}" field must be a valid JSON object.`);
    }
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new z.errors.Error(`The "${key}" field must be a valid JSON object.`);
  }

  return value;
};

const buildGeneratePdfRequest = (z: ZObject, inputData: Bundle['inputData']) => {
  const {
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    authenticationUsername,
    authenticationAccessCode,
    viewportWidth,
    viewportHeight,
    ...request
  } = inputData as Record<string, any>;

  const margin = {
    ...(marginTop !== undefined && marginTop !== '' && { top: marginTop }),
    ...(marginBottom !== undefined && marginBottom !== '' && { bottom: marginBottom }),
    ...(marginLeft !== undefined && marginLeft !== '' && { left: marginLeft }),
    ...(marginRight !== undefined && marginRight !== '' && { right: marginRight }),
  };

  if (Object.keys(margin).length > 0) {
    request.margin = margin;
  }

  if (authenticationUsername !== undefined && authenticationUsername !== '') {
    request.authentication = {
      username: authenticationUsername,
      password: authenticationAccessCode,
    };
  }

  if (viewportWidth !== undefined || viewportHeight !== undefined) {
    request.viewport = {
      ...(viewportWidth !== undefined && { width: viewportWidth }),
      ...(viewportHeight !== undefined && { height: viewportHeight }),
    };
  }

  for (const key of JSON_OBJECT_FIELDS) {
    const value = parseJsonObjectField(z, key, request[key]);
    if (value === undefined) {
      delete request[key];
    } else {
      request[key] = value;
    }
  }

  return request;
};

export const generatePdf = {
  key: 'generatePdf',
  noun: 'PDF',
  display: {
    label: 'Generate PDF',
    description: 'Generate a PDF from a URL or raw HTML.',
  },
  operation: {
    inputFields: [
      {
        key: 'html',
        label: 'HTML',
        type: 'text' as const,
        helpText: 'Raw HTML to render as a PDF. Provide either this or URL.',
      },
      {
        key: 'url',
        label: 'URL',
        type: 'string' as const,
        helpText: 'The URL to render as a PDF. Provide either this or HTML.',
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-Signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Seconds until the file URL expires (min 60, max 86400).',
      },
      {
        key: 'pageSizeType',
        label: 'Page Size',
        type: 'string' as const,
        required: false,
        choices: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'ledger', 'tabloid', 'legal', 'letter'],
      },
      {
        key: 'enableFormFields',
        label: 'Enable Form Fields',
        type: 'boolean' as const,
        required: false,
        helpText: 'Includes supported interactive HTML form fields in the generated PDF.',
      },
      {
        key: 'width',
        label: 'Width',
        type: 'number' as const,
        required: false,
        helpText: 'Custom PDF file width in pixels. Must be provided with Height.',
      },
      {
        key: 'height',
        label: 'Height',
        type: 'number' as const,
        required: false,
        helpText: 'Custom PDF file height in pixels. Must be provided with Width.',
      },
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'string' as const,
        required: false,
        choices: ['portrait', 'landscape'],
      },
      {
        key: 'header',
        label: 'Header',
        type: 'text' as const,
        required: false,
        helpText: 'HTML content to render in the PDF page header. Top Margin must also be set.',
      },
      {
        key: 'footer',
        label: 'Footer',
        type: 'text' as const,
        required: false,
        helpText: 'HTML content to render in the PDF page footer. Bottom Margin must also be set.',
      },
      {
        key: 'marginTop',
        label: 'Top Margin',
        type: 'string' as const,
        required: false,
        helpText: 'Top page margin, such as `20px`, `1in`, or `2cm`.',
      },
      {
        key: 'marginBottom',
        label: 'Bottom Margin',
        type: 'string' as const,
        required: false,
        helpText: 'Bottom page margin, such as `20px`, `1in`, or `2cm`.',
      },
      {
        key: 'marginLeft',
        label: 'Left Margin',
        type: 'string' as const,
        required: false,
        helpText: 'Left page margin, such as `20px`, `1in`, or `2cm`.',
      },
      {
        key: 'marginRight',
        label: 'Right Margin',
        type: 'string' as const,
        required: false,
        helpText: 'Right page margin, such as `20px`, `1in`, or `2cm`.',
      },
      {
        key: 'timeout',
        label: 'Timeout (milliseconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Maximum wait time to render HTML content. Maximum is 900000 ms.',
      },
      {
        key: 'javascript',
        label: 'JavaScript',
        type: 'code' as const,
        required: false,
      },
      {
        key: 'css',
        label: 'CSS',
        type: 'code' as const,
        required: false,
      },
      {
        key: 'emulateMediaType',
        label: 'Emulate Media Type',
        type: 'string' as const,
        required: false,
        choices: ['screen', 'print'],
        helpText: 'Sets the CSS media type of the document.',
      },
      {
        key: 'waitForSelector',
        label: 'Wait for Selector',
        type: 'string' as const,
        required: false,
        helpText: 'Waits for a CSS selector to load. Times out after 30 seconds.',
      },
      {
        key: 'clickSelector',
        label: 'Click Selector',
        type: 'string' as const,
        required: false,
        helpText: 'Waits for and clicks a CSS selector before generating the PDF.',
      },
      {
        key: 'clickSelectorChainSetup',
        label: 'Click Selector Chain Setup (JSON)',
        type: 'json' as const,
        required: false,
        helpText:
          'Advanced click setup JSON. When provided, Click Selector is ignored. Example: {"ignoreFailingChains":true,"chains":[{"selectors":["#cookieDialog"]},{"selectors":[".popupClose"]}]}',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ignoreFailingChains: { type: 'boolean' },
            chains: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  selectors: { type: 'array', items: { type: 'string' } },
                },
                required: ['selectors'],
              },
            },
          },
          required: ['chains'],
        },
      },
      {
        key: 'waitForNetworkIdle',
        label: 'Wait for Network Idle',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'delay',
        label: 'Delay (milliseconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Delay before generating the PDF. Maximum is 20000 ms.',
      },
      {
        key: 'loadImages',
        label: 'Load Images',
        type: 'boolean' as const,
        required: false,
        helpText: 'Waits for all images to finish loading before generating the PDF.',
      },
      {
        key: 'scale',
        label: 'Scale',
        type: 'number' as const,
        required: false,
        helpText: 'Page scale factor. Accepts values between 0.1 and 2.',
      },
      {
        key: 'pageRanges',
        label: 'Page Ranges',
        type: 'string' as const,
        required: false,
        helpText: 'Page ranges to include, such as "1-5" or "1,3,5".',
      },
      {
        key: 'printBackground',
        label: 'Print Background',
        type: 'boolean' as const,
        required: false,
      },
      {
        key: 'userAgent',
        label: 'User Agent',
        type: 'string' as const,
        required: false,
      },
      {
        key: 'httpHeaders',
        label: 'HTTP Headers',
        dict: true,
        required: false,
        helpText: 'Custom HTTP headers as key/value pairs.',
      },
      {
        key: 'authenticationUsername',
        label: 'Authentication Username',
        type: 'string' as const,
        required: false,
        helpText: 'HTTP Basic authentication username.',
      },
      {
        key: 'authenticationAccessCode',
        label: 'Authentication Access Code',
        type: 'string' as const,
        required: false,
        helpText: 'HTTP Basic authentication access code.',
      },
      {
        key: 'viewportWidth',
        label: 'Viewport Width',
        type: 'number' as const,
        required: false,
        helpText: 'Browser viewport width in pixels before rendering.',
      },
      {
        key: 'viewportHeight',
        label: 'Viewport Height',
        type: 'number' as const,
        required: false,
        helpText: 'Browser viewport height in pixels before rendering.',
      },
      {
        key: 'metadata',
        label: 'Metadata (JSON)',
        type: 'json' as const,
        required: false,
        helpText: 'Custom data to store on the document record.',
        schema: {
          type: 'object',
          additionalProperties: true,
        },
      },
    ],
    perform: async (z: ZObject, bundle: Bundle) => {
      const client = getClient(bundle);
      return withErrorHandling(z, () =>
        client.generatePdf(buildGeneratePdfRequest(z, bundle.inputData) as any),
      );
    },
    sample: SAMPLE_DOCUMENT,
  },
};
