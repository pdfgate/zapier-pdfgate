import { version as platformVersion } from 'zapier-platform-core';
import { authentication } from './auth';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const App = {
  version,
  platformVersion,
  authentication,
  triggers: {},
  searches: {},
  creates: {},
};

export default App;
module.exports = App;
