import {SQSHandler} from 'aws-lambda';
import {SQS} from 'aws-sdk';

const sqs = new SQS();

// NOTE : lambda will remove messages automatically! https://docs.aws.amazon.com/lambda/latest/dg/with-sqs-example.html
// Once a batch of messages is processed successfully, all messages in the batch are automatically deleted from the queue.
// If the handler throws an exception, Lambda considers the input of messages as not processed and invokes the function with the same batch of messages.


export const handler: SQSHandler = async (event, context) => {
  // NOTE : Alternatively you can remove messages yourself. See code below for an example.
  // This is ONLY recommended if you need to ensure a successful message is not ran more than once.
  // In all other cases just let the lambda system remove the messages automatically. No code required.
  // It is recommended that you setup a Dead-Letter Queue so that you can limit the number of retries.

  const entries = [];

  for (const record of event.Records) {
    try {
      // Do some business logic on the message.
      // ...
      console.log('You got a message:', record.body);
      const body = JSON.parse(record.body);

      // If business logic succeeds, then message will be marked for removal from queue.
      entries.push({Id: record.messageId, ReceiptHandle: record.receiptHandle});
    } catch (e) {
      // If business logic fails, then message will remain in queue.
      console.log('Error', e);
    }
  }

  if (entries.length === event.Records.length) return;

  // This removes the message that did not throw an exception while being processed so that they don't run again.
  await sqs.deleteMessageBatch({Entries: entries, QueueUrl: process.env.SQS_URL}).promise();
  throw new Error(`Failed to process ${event.Records.length - entries.length} messages. See the log for details.`);
};

