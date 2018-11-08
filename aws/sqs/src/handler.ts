import {SQSHandler} from '../../libs/lambda-util/node_modules/@types/aws-lambda';
import {SQS} from 'aws-sdk';

const sqs = new SQS();

export const handler: SQSHandler = async (event, context) => {
  const entries = [];

  for (const record of event.Records) {
    try {
      console.log('You got a message:', record.body);
      entries.push({Id: record.messageId, ReceiptHandle: record.receiptHandle});
    } catch (e) {
      console.log('Error', e);
    }
  }

  // NOTE : lambda remove messages automatically! https://docs.aws.amazon.com/lambda/latest/dg/with-sqs-example.html
  // Once a message is processed successfully, it is automatically deleted from the queue.
  // If the handler throws an exception, Lambda considers the input of messages as not processed and invokes the function with the same batch of messages.

  // No need to do this! YAY
  // await sqs.deleteMessageBatch({Entries: entries, QueueUrl: process.env.SQS_URL}).promise();
};

