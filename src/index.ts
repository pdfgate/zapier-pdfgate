import { version as platformVersion } from 'zapier-platform-core';
import { authentication } from './auth';
import { generatePdf } from './actions/generatePdf';
import { uploadFile } from './actions/uploadFile';
import { flattenPdf } from './actions/flattenPdf';
import { compressPdf } from './actions/compressPdf';
import { extractFormData } from './actions/extractFormData';
import { protectPdf } from './actions/protectPdf';
import { watermarkPdf } from './actions/watermarkPdf';
import { createEnvelope } from './actions/createEnvelope';
import { sendEnvelope } from './actions/sendEnvelope';
import { getDocument } from './searches/getDocument';
import { getEnvelope } from './searches/getEnvelope';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const App = {
  version,
  platformVersion,
  authentication,
  triggers: {},
  searches: {
    [getDocument.key]: getDocument,
    [getEnvelope.key]: getEnvelope,
  },
  creates: {
    [generatePdf.key]: generatePdf,
    [uploadFile.key]: uploadFile,
    [flattenPdf.key]: flattenPdf,
    [compressPdf.key]: compressPdf,
    [extractFormData.key]: extractFormData,
    [protectPdf.key]: protectPdf,
    [watermarkPdf.key]: watermarkPdf,
    [createEnvelope.key]: createEnvelope,
    [sendEnvelope.key]: sendEnvelope,
  },
};

export default App;
module.exports = App;
