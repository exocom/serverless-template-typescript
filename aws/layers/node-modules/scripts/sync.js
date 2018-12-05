const path = require('path');
const {promisify} = require('util');
const rimraf = require('rimraf');

const rimrafAsync = promisify(rimraf);
const dir = path.join(__dirname, '../src/nodejs/node8/node_modules');

(async () => {
  await rimrafAsync(dir);
  // yarn install --flat --production --modules-folder='nodejs/node8/node_modules' --no-lockfile

})();
