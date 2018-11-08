'use strict';
const path = require('path');
const {exists, readFile} = require('fs');
const {promisify} = require('util');
const md5File = require('md5-file/promise');
const gulp = require('gulp');

//const Server = require('./Server');


const fs = {
  exists: promisify(exists),
  readFile: promisify(readFile)
};

class ServerlessLocalServer {
  constructor() {
    this.options = {
      projectPath: ''
    };
    //this.server = new Server();
  }

  async init() {
    const hasJson = await fs.exists('.serverless/serverless.json');
    if (hasJson) {
      const md5 = await md5File('serverless.yml');
      const json = await fs.readFile('.serverless/serverless.json');
      this.slsYaml = JSON.parse(json);
    }
  }

  async start() {
    await this.init();
    console.log("slsYaml", this.slsYaml);
    //this.server
  }
}

module.exports = {
  ServerlessLocalServer
};
