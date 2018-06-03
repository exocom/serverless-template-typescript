import {ObjectId} from 'bson';
import mongoose from 'mongoose';
import {ApiGatewayHandler, ApiGatewayUtil} from './utils/api-gateway-util';
import {default as MongooseUser, UserDocument} from './models/mongoose/mongoose-user';
import {deserialize, plainToClass} from 'class-transformer';
import {UserCreateRequest, UserGetParamsRequest} from './models/requests/user.request';
import {validate} from 'class-validator';

mongoose.connect(process.env.MONGODB_URI);
const apiGatewayUtil = new ApiGatewayUtil();

// GET /api/users
export const getUsers: ApiGatewayHandler = async (event, context) => {
  const users = await MongooseUser.find<Array<UserDocument>>().exec();
  return apiGatewayUtil.apiResponse({body: {data: users}});
};

// POST /api/users
export const postUsers: ApiGatewayHandler = async (event, context) => {
  try {
    const body = deserialize(UserCreateRequest, event.body);
    const errors = await validate(body);
    if (errors && errors.length) return apiGatewayUtil.apiResponse({statusCode: 400, body: {errors}});

    // TODO : Check for any conflicting records in db. IE unique keys like username. etc.

    const userDocument: UserDocument = new MongooseUser(body);
    // TODO : normalize errors.
    await userDocument.save();

    return apiGatewayUtil.apiResponse({statusCode: 201, body: {data: userDocument}});

  } catch (err) {
    const errors = [{
      type: 'ApiError',
      message: err && err.message || err
    }];
    return apiGatewayUtil.apiResponse({statusCode: 500, body: {errors}});
  }
};

// GET /api/users/{userId}
export const getUser: ApiGatewayHandler = async (event, context) => {
  const pathParameters = plainToClass(UserGetParamsRequest, event.pathParameters);
  const errors = await validate(pathParameters);
  if (errors && errors.length) return apiGatewayUtil.apiResponse({statusCode: 400, body: {errors}});

  const user = await MongooseUser.findOne<UserDocument>(c => c.id === pathParameters.userId).exec();
  if (!user) {
    const errors = [{
      type: 'ApiError',
      message: 'No user was found with the given id.'
    }];
    return apiGatewayUtil.apiResponse({statusCode: 404, body: {errors}});
  }

  return apiGatewayUtil.apiResponse({body: {data: user}});
};