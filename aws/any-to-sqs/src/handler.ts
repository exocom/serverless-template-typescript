import {SQS} from 'aws-sdk';

const sqs = new SQS();

export const eventToQueue = async (event) => {
  const sendMessageResult = await sqs.sendMessage({
    MessageBody: JSON.stringify(event),
    QueueUrl: process.env.SQS_QUEUE_URL
  }).promise();

  console.log(`Event added to Queue. : ${sendMessageResult.MessageId}`);
};
