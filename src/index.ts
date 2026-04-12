import { version as platformVersion } from 'zapier-platform-core';
import { authentication } from './auth';
import { generatePdf } from './actions/generatePdf';
import { uploadFile } from './actions/uploadFile';
import { flattenPdf } from './actions/flattenPdf';
import { compressPdf } from './actions/compressPdf';
import { extractFormData } from './actions/extractFormData';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const App = {
  version,
  platformVersion,
  authentication,
  triggers: {},
  searches: {},
  creates: {
    [generatePdf.key]: generatePdf,
    [uploadFile.key]: uploadFile,
    [flattenPdf.key]: flattenPdf,
    [compressPdf.key]: compressPdf,
    [extractFormData.key]: extractFormData,
  },
};

export default App;
module.exports = App;
