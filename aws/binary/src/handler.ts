import AWS = require('aws-sdk');
import {LambdaUtil} from '../../libs/lambda-util/lambda-util';


const lambdaUtil = new LambdaUtil();
const polly = new AWS.Polly();

export const postSpeech = async (event, context) => {
  // 1st check if file exists on s3.
  // If so steam it

  // Else create file on polly and then stream to s3 and user
  const {AudioStream} = await polly.synthesizeSpeech({
    LexiconNames: [
      'kalarrs'
    ],
    OutputFormat: 'mp3',
    SampleRate: '8000',
    Text: 'Hey kalarrs! How are you?',
    TextType: 'text',
    VoiceId: 'Kimberly'
  }).promise();

  return lambdaUtil.apiResponseBinary({
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'audio/mpeg'
    },
    body: (AudioStream as Buffer)
  });
};
