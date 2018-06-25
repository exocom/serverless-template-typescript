import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';

type headers = {
  [header: string]: boolean | number | string;
}

export class ApiGatewayUtil {
  private _headers: headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  };

  constructor(headers = null) {
    if (headers) this._headers = headers;
  }

  apiResponse<T>({statusCode = 200, body = null, headers = this._headers}: ApiResponse<T>): APIGatewayProxyResult {
    return {
      statusCode,
      body: body ? JSON.stringify(body) : null,
      headers
    };
  }
}

export type ApiGatewayHandler = (
  event: APIGatewayEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

interface ApiResponse<T> {
  statusCode?: number;
  body?: ApiBody<T> | ApiErrorsBody<T>;
  headers?: headers;
}

export class ApiBody<T> {
  data: T;
  meta?: Meta;
}

export class ApiErrorsBody<T> {
  errors: Array<T>;
  meta?: Meta;
}


export interface Meta {
}
