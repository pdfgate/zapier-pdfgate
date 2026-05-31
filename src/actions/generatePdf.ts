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
        key: 'url',
        label: 'URL',
        type: 'string' as const,
        helpText:
          "Public URL whose rendered content should be converted to PDF. Required if 'HTML Content' is not provided.",
      },
      {
        key: 'html',
        label: 'HTML Content',
        type: 'text' as const,
        helpText: "Raw HTML markup to convert to PDF. Required if 'URL' is not provided.",
      },
      {
        key: 'preSignedUrlExpiresIn',
        label: 'Pre-signed URL Expiry (seconds)',
        type: 'integer' as const,
        required: false,
        helpText:
          'Number of seconds the returned fileUrl remains valid. Allowed range: 60 to 86400 seconds.',
      },
      {
        key: 'pageSizeType',
        label: 'Page Size',
        type: 'string' as const,
        required: false,
        choices: ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'ledger', 'tabloid', 'legal', 'letter'],
        helpText: 'PDF page size.',
      },
      {
        key: 'enableFormFields',
        label: 'Enable Fillable Form Fields',
        type: 'boolean' as const,
        required: false,
        helpText:
          'If true, HTML input fields are rendered as interactive PDF form fields. Supports text, checkbox, textarea, select, email, number, date/time, radio, and pdfgate-signature-field.',
      },
      {
        key: 'width',
        label: 'Custom Width (px)',
        type: 'number' as const,
        required: false,
        helpText:
          'Custom PDF width in pixels. Must be used together with Custom Height. If used, it overrides the Page Size.',
      },
      {
        key: 'height',
        label: 'Custom Height (px)',
        type: 'number' as const,
        required: false,
        helpText:
          'Custom PDF height in pixels. Must be used together with Custom Width. If used, it overrides the Page Size.',
      },
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'string' as const,
        required: false,
        choices: ['portrait', 'landscape'],
        helpText: 'Page orientation. Options: portrait, landscape.',
      },
      {
        key: 'header',
        label: 'Header HTML',
        type: 'text' as const,
        required: false,
        helpText:
          'HTML snippet rendered as the page header on every PDF page. Note: Margin Top must also be set so the header has enough space to appear correctly.',
      },
      {
        key: 'footer',
        label: 'Footer HTML',
        type: 'text' as const,
        required: false,
        helpText:
          'HTML snippet rendered as the page footer on every PDF page. Note: you also need to set Margin Bottom to make space for the footer, for example 80px or 2cm.',
      },
      {
        key: 'marginTop',
        label: 'Margin Top',
        type: 'string' as const,
        required: false,
        helpText:
          'Set the top margin of the generated PDF. Use CSS-style length values such as 20px, 1cm, 10mm, or 0.5in.',
      },
      {
        key: 'marginBottom',
        label: 'Margin Bottom',
        type: 'string' as const,
        required: false,
        helpText:
          'Set the bottom margin of the generated PDF. Use CSS-style length values such as 20px, 1cm, 10mm, or 0.5in.',
      },
      {
        key: 'marginLeft',
        label: 'Margin Left',
        type: 'string' as const,
        required: false,
        helpText:
          'Set the left margin of the generated PDF. Use CSS-style length values such as 20px, 1cm, 10mm, or 0.5in.',
      },
      {
        key: 'marginRight',
        label: 'Margin Right',
        type: 'string' as const,
        required: false,
        helpText:
          'Set the right margin of the generated PDF. Use CSS-style length values such as 20px, 1cm, 10mm, or 0.5in.',
      },
      {
        key: 'timeout',
        label: 'Render Timeout (milliseconds)',
        type: 'integer' as const,
        required: false,
        helpText: 'Maximum wait time for HTML to render.',
      },
      {
        key: 'javascript',
        label: 'Inject JavaScript',
        type: 'code' as const,
        required: false,
        helpText: 'JavaScript code to be executed on the page before PDF capture.',
      },
      {
        key: 'css',
        label: 'Inject CSS',
        type: 'code' as const,
        required: false,
        helpText: 'CSS rules injected into the page before PDF capture.',
      },
      {
        key: 'emulateMediaType',
        label: 'Emulate Media Type',
        type: 'string' as const,
        required: false,
        choices: ['screen', 'print'],
        helpText: 'Force a specific CSS media type. Options: screen, print.',
      },
      {
        key: 'waitForSelector',
        label: 'Wait For CSS Selector',
        type: 'string' as const,
        required: false,
        helpText: 'Waits for a CSS selector to load. Times out after 30 seconds.',
      },
      {
        key: 'clickSelector',
        label: 'Click CSS Selector',
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
        label: 'Wait For Network Idle',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, waits until there are no active network connections in the page before generating the PDF.',
      },
      {
        key: 'delay',
        label: 'Render Delay (milliseconds)',
        type: 'integer' as const,
        required: false,
        helpText:
          'Adds a delay before generating the PDF. Max 20000 (20 seconds). It is useful for async content.',
      },
      {
        key: 'loadImages',
        label: 'Load Images',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, waits for all images to finish loading before generating the PDF.',
      },
      {
        key: 'scale',
        label: 'Page Scale',
        type: 'number' as const,
        required: false,
        helpText: 'Page scale factor. Accepts values between 0.1 and 2..',
      },
      {
        key: 'pageRanges',
        label: 'Page Ranges',
        type: 'string' as const,
        required: false,
        helpText: "Pages to include, e.g. '1-5' or '1,3,5'. If empty, all pages are included.",
      },
      {
        key: 'printBackground',
        label: 'Print Backgrounds',
        type: 'boolean' as const,
        required: false,
        helpText: 'If true, background graphics are included in the PDF.',
      },
      {
        key: 'userAgent',
        label: 'User Agent',
        type: 'string' as const,
        required: false,
        helpText: 'Custom User-Agent string used when fetching the page.',
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
        label: 'Metadata',
        type: 'json' as const,
        required: false,
        helpText:
          'Optional metadata as JSON key-value pairs. Example: {"customerId":"123","invoiceId":"INV-001"}',
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
