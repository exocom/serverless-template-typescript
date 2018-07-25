import {ObjectId} from 'bson';
import mongoose from 'mongoose';
import {ApiGatewayHandler, LambdaUtil} from '../../libs/lambda-util/lambda-util';
import {default as MongooseUser, UserDocument} from './models/mongoose/mongoose-user';
import {deserialize, plainToClass} from 'class-transformer';
import {UserCreateRequest, UserGetParamsRequest} from './models/requests/user.request';
import {validate} from 'class-validator';

mongoose.connect(process.env.MONGODB_URI);
const lambdaUtil = new LambdaUtil();

// GET /api/users
export const getUsers: ApiGatewayHandler = async (event, context) => {
  const users = await MongooseUser.find<Array<UserDocument>>().exec();
  return lambdaUtil.apiResponseJson({body: {data: users}});
};

// POST /api/users
export const postUsers: ApiGatewayHandler = async (event, context) => {
  try {
    const body = deserialize(UserCreateRequest, event.body);
    const errors = await validate(body);
    if (errors && errors.length) return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});

    // TODO : Check for any conflicting records in db. IE unique keys like username. etc.

    const userDocument: UserDocument = new MongooseUser(body);
    // TODO : normalize errors.
    await userDocument.save();

    return lambdaUtil.apiResponseJson({statusCode: 201, body: {data: userDocument}});

  } catch (err) {
    const errors = [{
      type: 'ApiError',
      message: err && err.message || err
    }];
    return lambdaUtil.apiResponseJson({statusCode: 500, body: {errors}});
  }
};

// GET /api/users/{userId}
export const getUser: ApiGatewayHandler = async (event, context) => {
  const pathParameters = plainToClass(UserGetParamsRequest, event.pathParameters);
  const errors = await validate(pathParameters);
  if (errors && errors.length) return lambdaUtil.apiResponseJson({statusCode: 400, body: {errors}});

  const user = await MongooseUser.findById<UserDocument>(pathParameters.userId).exec();
  if (!user) {
    const errors = [{
      type: 'ApiError',
      message: 'No user was found with the given id.'
    }];
    return lambdaUtil.apiResponseJson({statusCode: 404, body: {errors}});
  }

  return lambdaUtil.apiResponseJson({body: {data: user}});
};
