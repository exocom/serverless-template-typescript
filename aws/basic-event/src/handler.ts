import {ScheduleEventHandler} from '@kalarrs/aws-util';
import {MongoClient, UnorderedBulkOperation} from 'mongodb';
import moment = require('moment');

const mongoPromise = MongoClient.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

export const newUsers: ScheduleEventHandler = async () => {
  const client: MongoClient = await mongoPromise;

  const yesterday = moment().subtract(24, 'hours').toDate();
  const newUsers = await client.db().collection('users').countDocuments({createdAt: {$gt: yesterday}});

  const message = `${newUsers} new users accounts create in the last 24 hours`;
  console.log(message); // This is here so that it will show up in cloud watch logs.
  return message;
};
