import {Callback, Context} from 'aws-lambda';

export interface Response<T> {
  statusCode: number,
  headers: object,
  body: object,
  cb: Callback<T>;
}
export class ApiGatewayUtil {
  private _headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  };

  constructor(headers = null) {
    if (headers) this._headers = headers;
  }

  sendResponse<T>({statusCode, body, headers = this._headers, cb}) {
    cb(null, {
      statusCode,
      body: JSON.stringify(body),
      headers
    })
  }

  sendApiResponse<T>({statusCode = 200, body, headers = this._headers}) {
    return {
      statusCode,
      body: JSON.stringify(body),
      headers
    };
  }
}

export type Handler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context,
  callback: Callback<TResult>,
) => void | Promise<void>;

export class ApiBody<T> {
  data: T;
  meta?: Meta;
}

export interface Meta {
}

export class ApiUtil {

  validation() {
    return {
      type: 'ApiError',
      message: 'Invalid change provided. Please provide id and description. Id must be valid BSON ObjectID.'
    }
  }
}