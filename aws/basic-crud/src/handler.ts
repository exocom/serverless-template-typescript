import {ObjectId} from 'bson';
import {LambdaUtil, ApiGatewayHandler} from '../../libs/lambda-util/lambda-util';
import {deserialize, Transform} from 'class-transformer';
import {Length, validate} from 'class-validator';

const lambdaUtil = new LambdaUtil();

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
  return lambdaUtil.apiResponseJson({statusCode: 200, body: {data: changes}});
};

export const postChanges: ApiGatewayHandler = async (event, context) => {
  try {
    const body = deserialize(Change, event.body);
    const errors = await validate(body);

    if (errors && errors.length) return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});

    if (changes.find(c => c.id.equals(body.id))) {
      const errors = [{
        type: 'ApiError',
        message: 'A change with that Id already exits.'
      }];
      return lambdaUtil.apiResponseJson({statusCode: 409, body: {errors}});
    }

    const change = {
      id: body.id,
      description: body.description
    };

    changes.push(change);

    return lambdaUtil.apiResponseJson({statusCode: 201, body: {data: change}});

  } catch (err) {
    const errors = [{
      type: 'ApiError',
      message: err && err.message || err
    }];
    return lambdaUtil.apiResponseJson({statusCode: 500, body: {errors}});
  }
};

export const getChange: ApiGatewayHandler = async (event, context) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    const errors = [{
      type: 'ApiError',
      message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});
  }

  const change = changes.find(c => c.id.equals(event.pathParameters.changeId));
  if (!change) {
    const errors = [{
      type: 'ApiError',
      message: 'No change was found with the given id.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 404, body: {errors}});
  }

  return lambdaUtil.apiResponseJson({statusCode: 200, body: {data: change}});
};

export const deleteChange: ApiGatewayHandler = async (event, context) => {
  const changeId = event && event.pathParameters && event.pathParameters.changeId;
  if (!changeId || !ObjectId.isValid(changeId)) {
    const errors = [{
      type: 'ApiError',
      message: 'Invalid id changeId provided. Please provide a valid BSON ObjectID.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});
  }

  const change = changes.find(c => c.id.equals(event.pathParameters.changeId));
  if (!change) {
    const errors = [{
      type: 'ApiError',
      message: 'No change was found with the given id.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 404, body: {errors}});
  }

  changes.splice(changes.indexOf(change), 1);
  return lambdaUtil.apiResponseJson({statusCode: 204, body: null});
};
