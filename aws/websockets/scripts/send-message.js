const {ApiGatewayManagementApi, SharedIniFileCredentials} = require("aws-sdk");

const connectionId = '';
const domainName = 'gppdvcocd0.execute-api.us-west-2.amazonaws.com';
const stage = 'dev';

const credentials = new SharedIniFileCredentials({profile: 'kalarrs'});
const apigwManagementApi = new ApiGatewayManagementApi({
  region: 'us-west-2',
  apiVersion: '2018-11-29',
  endpoint: `${domainName}/${stage}`,
  credentials
});

(async () => {
  await apigwManagementApi.postToConnection({
    ConnectionId: connectionId,
    Data: JSON.stringify({foo: 'bar'})
  }).promise();
})();
