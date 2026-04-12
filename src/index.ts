import { version as platformVersion } from 'zapier-platform-core';
import { authentication } from './auth';
import { generatePdf } from './actions/generatePdf';

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
  },
};

export default App;
module.exports = App;
