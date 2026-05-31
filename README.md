# PDFGate Zapier Integration

The PDFGate Zapier integration provides Zapier actions, and instant triggers for [PDFGate](https://pdfgate.com).

## Features

Actions:

- Generate PDF
- Upload File
- Flatten PDF
- Compress PDF
- Extract PDF Form Data
- Protect PDF
- Watermark PDF
- Create Envelope
- Send Envelope
- Delete Document

Searches:

- Get Document
- Get Envelope

Triggers:

- Envelope Sent
- Envelope Completed

## Requirements

- Node.js 18 or later
- npm
- A PDFGate API key starting with `test_` for sandbox or `live_` for production
- PDFGate document storage should be enabled for at least 1 month. You can set this in the PDFGate dashboard under Settings -> Storage.
- Zapier CLI access when deploying or testing inside Zapier

## Installation

```bash
npm install
```

## Development

Build the TypeScript source:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run type checking without emitting files:

```bash
npm run typecheck
```

The package entrypoint is [index.js](./index.js), which loads the compiled app from `dist/index.js`. Run `npm run build` before using the app through Zapier tooling.

## Authentication

The integration uses Zapier custom authentication with one field:

- `apiKey`: your PDFGate API key

The authentication test calls PDFGate with a known missing document ID. A `401` response is treated as invalid credentials; other expected non-auth failures are allowed so the connection can be verified without requiring an existing document.

## Webhook Triggers

The envelope triggers subscribe to PDFGate webhooks through the PDFGate API:

- `envelope.sent`
- `envelope.completed`

Each trigger stores the webhook `id` and `secret` returned by PDFGate.

## Project Structure

```text
src/
  actions/      Zapier create actions
  searches/     Zapier search actions
  triggers/     Zapier instant triggers
  auth.ts       Zapier authentication configuration
  client.ts     PDFGate client factory and shared error handling
  webhooks.ts   Webhook subscribe, unsubscribe, and sample helpers
  index.ts      Zapier app definition
test/           Jest tests
```

## Deployment

Build the project before deploying:

```bash
npm run build
```

Then use the Zapier CLI from this directory to validate, register, or push the app according to the Zapier platform workflow used by PDFGate.

Common commands:

```bash
zapier-platform validate
zapier-platform push 
```

## License

This project is distributed under the terms of the [MIT License](./LICENSE).
