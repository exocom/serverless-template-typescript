import {ApiGatewayManagementApi} from 'aws-sdk';
import {ApiGatewayUtil, ApiGatewayWebsocketHandler} from '@kalarrs/aws-util';


const apiGatewayUtil = new ApiGatewayUtil();

export const handler: ApiGatewayWebsocketHandler = async (event, context) => {
  const {eventType, connectionId, routeKey, domainName, stage} = event.requestContext;

  console.log(eventType);
  console.log(event);
  console.log('=======================');
  switch (eventType) {
    case 'CONNECT':
      console.log(`Connection created! Connection ID: ${connectionId}`);
      console.log(`${domainName}/${stage}`);
      return {
        statusCode: 200,
        body: JSON.stringify({eventType, connectionId, routeKey})
      };
    case 'DISCONNECT':
      console.log(`Lost connection! Connection ID: ${connectionId}`);
      return {statusCode: 200, body: 'Disconnected'};
    case 'MESSAGE':
      const {body, isBase64Encoded} = event;
      if (typeof body === 'string') {
        console.log(`Message received! Message: ${isBase64Encoded ? Buffer.from(body, 'base64') : body}`);
      } else {
        console.log(`Binary data received!`);
      }
      return {statusCode: 200, body: null};
    case 'DEFAULT':
      const apigwManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: `${domainName}/${stage}`
      });
      await apigwManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({foo: 'bar'})
      }).promise();
      return {statusCode: 200, body: 'Data sent.'};
  }

  const data = {foo: 'hello'};
  return apiGatewayUtil.sendJson({body: {data}});
};
