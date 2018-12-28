import {ObjectId} from 'bson';
import mongoose from 'mongoose';
import {ApiGatewayHandler, ApiGatewayUtil} from '@kalarrs/aws-util';
import {default as MongooseUser, UserDocument} from './models/mongoose/mongoose-user';
import {deserialize, plainToClass} from 'class-transformer';
import {UserCreateRequest, UserGetParamsRequest} from './models/requests/user.request';
import {validate} from 'class-validator';

const {MONGODB_URI} = process.env;

mongoose.connect(MONGODB_URI);
const apiGatewayUtil = new ApiGatewayUtil();

// GET /api/users
export const getUsers: ApiGatewayHandler = async (event, context) => {
  const users = await MongooseUser.find<Array<UserDocument>>().exec();
  return apiGatewayUtil.sendJson({body: {data: users}});
};

// POST /api/users
export const postUsers: ApiGatewayHandler = async (event, context) => {
  try {
    const body = deserialize(UserCreateRequest, event.body);
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

    // TODO : Check for any conflicting records in db. IE unique keys like username. etc.

    const userDocument: UserDocument = new MongooseUser(body);
    // TODO : normalize errors.
    await userDocument.save();

    return apiGatewayUtil.sendJson({statusCode: 201, body: {data: userDocument}});

  } catch (err) {
    const error = {
      type: 'ApiError',
      message: err && err.message || err
    };
    return apiGatewayUtil.sendJson({statusCode: 500, body: {error}});
  }
};

// GET /api/users/{userId}
export const getUser: ApiGatewayHandler = async (event, context) => {
  const pathParameters = plainToClass(UserGetParamsRequest, event.pathParameters);
  const validationErrors = await validate(pathParameters);
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

  const user = await MongooseUser.findById<UserDocument>(pathParameters.userId).exec();
  if (!user) {
    const error = {
      type: 'ApiError',
      message: 'No user was found with the given id.'
    };
    return apiGatewayUtil.sendJson({statusCode: 404, body: {error}});
  }

  return apiGatewayUtil.sendJson({body: {data: user}});
};
