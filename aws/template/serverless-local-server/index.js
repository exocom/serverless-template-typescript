'use strict';
const path = require('path');
const {exists, readFile} = require('fs');
const {exec} = require('child_process');
const {promisify} = require('util');
const md5File = require('md5-file/promise');
const gulp = require('gulp');
const Server = require('./Server');


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
    this.paths.srcDir = path.join(this.paths.project, 'src');
  }

  async init() {
    await this.loadServerlessYaml();

    this.server = new Server();

    this.watchStreams = {
      slsYaml: gulp.watch(this.paths.slsYaml, () => this.loadServerlessYaml()),
      src: gulp.watch(`${this.paths.srcDir}/**`, () => {
        // TODO : console.debug stopping because code has changed!
        // NOTE : could just exit using process.exit(0);
        this.stop();
      }),
      slsJson: gulp.watch(this.paths.slsJson, () => this.processYaml())
    };
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

  processYaml() {
    console.log('processing yaml config :)');
  }

  async start() {
    await this.init();
  }

  stop() {
    Object.keys(this.watchStreams).forEach(k => {
      this.watchStreams[k].close && this.watchStreams[k].close();
    });
  }
}

module.exports = {
  ServerlessLocalServer
};
