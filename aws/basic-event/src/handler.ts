import {ScheduleEventHandler} from './utils/lambda-util';
import {MongoClient, UnorderedBulkOperation} from 'mongodb';
import moment = require('moment');

const mongoPromise = MongoClient.connect(process.env.MONGODB_URI);

export const newUsers: ScheduleEventHandler = async () => {
  const client: MongoClient = await mongoPromise;

  const yesterday = moment().subtract('24 hours');
  const newUsers = await client.db().collection('users').count({createdAt: {$gt: yesterday}});

  console.log(`${newUsers} new users accounts create in the last 24 hours`);
};

