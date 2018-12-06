import {ObjectId} from 'bson';
import {ApiGatewayUtil, ApiGatewayHandler} from '@kalarrs/aws-util';
import {deserialize, Transform} from 'class-transformer';
import {Length, validate} from 'class-validator';

const apiGatewayUtil = new ApiGatewayUtil();

class Change {
  @Transform(value => ObjectId(value), {toClassOnly: true})
  id: ObjectId;

  @Length(5, 250)
  description: string;
}

const changes: Array<Change> = [
  {
    id: ObjectId('5a1b5ae36758c40453e5e024'),
    description: 'This is an example'
  },
  {
    id: ObjectId('5a1b5b176758c40453e5e025'),
    description: 'Of a simple mock API'
  }
];

export const getChanges: ApiGatewayHandler = async (event, context) => {
  return apiGatewayUtil.sendJson({statusCode: 200, body: {data: changes}});
};

export const postChanges: ApiGatewayHandler = async (event, context) => {
  try {
    const body = deserialize(Change, event.body);
    const validationErrors = await validate(body);

    if (validationErrors && validationErrors.length) return apiGatewayUtil.sendJson({
      statusCode: 400,
      body: {
        error: {
          type: 'ApiError',
          message: 'Failed validation.',
          validation: validationErrors
        }
      }
    });

    if (changes.find(c => c.id.equals(body.id))) {
      const error = {
        type: 'ApiError',
        message: 'A change with that Id already exits.'
      };
      return apiGatewayUtil.sendJson({statusCode: 409, body: {error}});
    }

    const change = {
      id: body.id,
      description: body.description
    };

    changes.push(change);

    return apiGatewayUtil.sendJson({statusCode: 201, body: {data: change}});

  } catch (err) {
    const error = {
      type: 'ApiError',
      message: err && err.message || err
    };
    return apiGatewayUtil.sendJson({statusCode: 500, body: {error}});
  }
};

export const getChange: ApiGatewayHandler = async (event, context) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    const error = {
      type: 'ApiError',
      message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
    };
    return apiGatewayUtil.sendJson({statusCode: 400, body: {error}});
  }

  const change = changes.find(c => c.id.equals(event.pathParameters.changeId));
  if (!change) {
    const error = {
      type: 'ApiError',
      message: 'No change was found with the given id.'
    };
    return apiGatewayUtil.sendJson({statusCode: 404, body: {error}});
  }

  return apiGatewayUtil.sendJson({statusCode: 200, body: {data: change}});
};

export const deleteChange: ApiGatewayHandler = async (event, context) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    const error = {
      type: 'ApiError',
      message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
    };
    return apiGatewayUtil.sendJson({statusCode: 400, body: {error}});
  }

  const change = changes.find(c => c.id.equals(event.pathParameters.changeId));
  if (!change) {
    const error = {
      type: 'ApiError',
      message: 'No change was found with the given id.'
    };
    return apiGatewayUtil.sendJson({statusCode: 404, body: {error}});
  }

  changes.splice(changes.indexOf(change), 1);
  return apiGatewayUtil.sendJson({statusCode: 204, body: null});
};
