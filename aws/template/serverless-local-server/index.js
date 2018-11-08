'use strict';
const path = require('path');
const {exists, readFile} = require('fs');
const {exec} = require('child_process');
const {promisify} = require('util');
const md5File = require('md5-file/promise');
const gulp = require('gulp');

//const Server = require('./Server');


const child = {
  exec: promisify(exec)
};

const fs = {
  exists: promisify(exists),
  readFile: promisify(readFile)
};

class ServerlessLocalServer {
  constructor(options) {
    // TODO : check if project-utils-plugin in in package.json :)

    this.paths = {
      project: options.projectPath || __dirname,
    };

    this.paths.slsYaml = path.join(this.paths.project, 'serverless.yml');
    this.paths.slsDir = path.join(this.paths.project, '.serverless');
    this.paths.slsJson = path.join(this.paths.slsDir, 'serverless.json');
  }

  async init() {
    await this.loadServerlessYaml();
    this.slsYamlWatchStream = gulp.watch(this.paths.slsYaml, () => this.loadServerlessYaml());
  }

  async loadServerlessYaml() {
    const hasJson = await fs.exists(this.paths.slsJson);
    if (!hasJson) {
      await child.exec('sls export', {cwd: this.paths.project});
      return this.loadServerlessYaml();
    }
    const md5 = await md5File(this.paths.slsYaml);
    const json = await fs.readFile(this.paths.slsJson);
    const slsYaml = JSON.parse(json);
    if (slsYaml.md5 !== md5) {
      await child.exec('sls export', {cwd: this.paths.project});
      return this.loadServerlessYaml();
    }
    this.slsYaml = slsYaml;
    // TODO : console.debug if flag
  }

  async start() {
    await this.init();
  }

  stop() {
    if (this.slsYamlWatchStream) this.slsYamlWatchStream.close();
  }
}

module.exports = {
  ServerlessLocalServer
};
