import {ObjectId} from 'bson';
import {ApiBody, ApiGatewayUtil, Handler} from './utils/routes';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {deserialize, Transform, Type} from 'class-transformer';
import {IsMongoId, Length, validate} from 'class-validator';

const apiGatewayUtil = new ApiGatewayUtil();



export const getChanges = async (event, context, cb) => {

  apiGatewayUtil.sendResponse({cb, statusCode: 200, body: {data: changes}});
};

class Change {
  @Transform(value => ObjectId(value), { toClassOnly: true })
  id: ObjectId;

  @Length(5, 250)
  description: string;
}

export const postChanges: Handler<APIGatewayProxyEvent, ApiBody<Change>> = async (event, context, cb) => {
  try {
    const body = deserialize(Change, event.body);
    console.log(body.id instanceof ObjectId);

    //const errors = await validate(body);

    const errors = [];
    if (errors && errors.length) {
      apiGatewayUtil.sendResponse({cb, statusCode: 400, body: {errors}});
      return;
    }

    if (changes.find(c => c.id.equals(body.id))) {
      const error = {
        type: 'ApiError',
        message: 'A change with that Id already exits.'
      };
      apiGatewayUtil.sendResponse({cb, statusCode: 409, body: {error}});
      return;
    }

    const change = {
      id: body.id,
      description: body.description
    };

    changes.push(change);

    apiGatewayUtil.sendResponse({cb, statusCode: 201, body: {data: change}});

  } catch (err) {
    const error = {
      type: 'ApiError',
      message: err && err.message || err
    };
    apiGatewayUtil.sendResponse({cb, statusCode: 500, body: {error}});
  }
};

export const getChange = async (event, context, cb) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    cb(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
        }
      }),
    });
    return;
  }

  const change = changes.find(c => c.id === event.pathParameters.changeId);
  if (!change) {
    cb(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'No change was found with the given id.'
        }
      }),
    });
    return;
  }

  cb(null, {
    statusCode: 200,
    body: JSON.stringify({
      data: change
    }),
  });
};

export const deleteChange = async (event, context, cb) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    cb(null, {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
        }
      }),
    });
    return;
  }

  const change = changes.find(c => c.id === event.pathParameters.changeId);
  if (!change) {
    cb(null, {
      statusCode: 404,
      body: JSON.stringify({
        error: {
          type: 'ApiError',
          message: 'No change was found with the given id.'
        }
      }),
    });
    return;
  }

  changes.splice(changes.indexOf(change), 1);

  cb(null, {
    statusCode: 204,
  });
};