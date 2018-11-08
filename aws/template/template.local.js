const {ServerlessLocalServer} = require('./serverless-local-server');


const serverlesslocalServer = new ServerlessLocalServer({
  projectPath: __dirname
});

serverlesslocalServer.start();


setTimeout(() => {
  serverlesslocalServer.stop();
}, 4000);
