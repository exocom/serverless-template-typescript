const {join} = require('path');
const {exec} = require('child_process');
const request = require('request-promise');
const {writeFile, readdir, stat, rename} = require('fs');
const {promisify} = require('util');
const rimraf = require('rimraf');

const childProcess = {
  exec: promisify(exec)
};

const fs = {
  rename: promisify(rename),
  stat: promisify(stat),
  readdir: promisify(readdir),
  writeFile: promisify(writeFile)
};

const rimrafAsync = promisify(rimraf);

const fileName = 'ffmpeg-git-amd64-static.tar.xz';
const url = `https://johnvansickle.com/ffmpeg/builds/${fileName}`;
const tarPath = join(__dirname, fileName);
const binPath = join(__dirname, '../src/bin');

const getDirs = async (path) => {
  let dirs = [];
  for (const file of await fs.readdir(path)) {
    if ((await fs.stat(join(path, file))).isDirectory()) {
      dirs = [...dirs, file]
    }
  }
  return dirs
};

(async () => {
  console.log('Removing directories in scripts');
  const dirs = await getDirs(__dirname);
  await Promise.all(dirs.map(d => rimrafAsync(join(__dirname, d))));

  console.log('Downloading latest version of ffmpeg');
  const body = await request(url, {encoding: 'binary'});
  await fs.writeFile(tarPath, body, 'binary');

  console.log('Untaring ffmepg');
  await childProcess.exec(`tar xf ${tarPath}`, {cwd: __dirname});

  const [ffmpegTempDir] = await getDirs(__dirname);
  const version = ffmpegTempDir.replace(/.*-(\d+)-.*/gi, '$1');

  console.log(`Updating to ffmpeg ${version}`);
  await rimrafAsync(binPath);
  await fs.rename(join(__dirname, ffmpegTempDir), binPath);

  console.log('Removing tar file');
  await rimrafAsync(tarPath);
})();
