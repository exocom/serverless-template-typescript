import {ApiGatewayManagementApi} from 'aws-sdk';
import {ApiGatewayUtil} from '@kalarrs/aws-util';
import {APIGatewayEventRequestContext, APIGatewayProxyResult, AuthResponseContext, Handler} from 'aws-lambda';

export interface APIGatewayProxyEvent<T = APIGatewayEventRequestContext> {
  body: string | null;
  headers: { [name: string]: string };
  multiValueHeaders: { [name: string]: string[] };
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: { [name: string]: string } | null;
  queryStringParameters: { [name: string]: string } | null;
  multiValueQueryStringParameters: { [name: string]: string[] } | null;
  stageVariables: { [name: string]: string } | null;
  requestContext: T;
  resource: string;
}

export interface APIGatewayProxyHandler<T = APIGatewayProxyEvent>  extends Handler<T, APIGatewayProxyResult> {
}

// API Gateway "websocket" request context
export interface APIGatewayWebsocketEventRequestContext {
  apiId: string;
  authorizer?: AuthResponseContext | null;
  connectedAt: number,
  connectionId: string,
  domainName: string,
  error: string,
  eventType: 'CONNECT' | 'DISCONNECT' | 'DEFAULT',
  extendedRequestId: string;
  identity: {
    accessKey: string | null;
    accountId: string | null;
    caller: string | null;
    cognitoAuthenticationProvider: string | null;
    cognitoAuthenticationType: string | null;
    cognitoIdentityId: string | null;
    cognitoIdentityPoolId: string | null;
    sourceIp: string;
    user: string | null;
    userAgent: string | null;
    userArn: string | null;
  };
  integrationLatency: string;
  messageDirection: 'IN' | 'OUT';
  messageId: string;
  requestId: string;
  requestTime: string;
  requestTimeEpoch: number;
  routeKey: string,
  stage: string;
  status: string;
}


const apiGatewayUtil = new ApiGatewayUtil();

export const handler: APIGatewayProxyHandler<APIGatewayProxyEvent<APIGatewayWebsocketEventRequestContext>> = async (event, context) => {
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
