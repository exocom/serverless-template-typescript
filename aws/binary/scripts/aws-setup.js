const AWS = require('aws-sdk');

const credentials = new AWS.SharedIniFileCredentials({profile: 'kalarrs'});
AWS.config.credentials = credentials;
AWS.config.update({region:'us-west-2'});

const polly = new AWS.Polly();

class AwsSetup {
  loadLexicons() {
    return polly.putLexicon({
      Content: `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0" 
      xmlns="http://www.w3.org/2005/01/pronunciation-lexicon"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
      xsi:schemaLocation="http://www.w3.org/2005/01/pronunciation-lexicon 
        http://www.w3.org/TR/2007/CR-pronunciation-lexicon-20071212/pls.xsd"
      alphabet="ipa" 
      xml:lang="en-US">
  <lexeme>
    <grapheme>kalarrs</grapheme>
    <phoneme>kælɑrs</phoneme>
  </lexeme>
</lexicon>`,
      Name: 'kalarrs'
    }).promise();
  }

  getLexicons () {
    return polly.getLexicon({Name: 'kalarrs'}).promise();
  }

  async init() {
    await this.loadLexicons();
  }

  async check(){
    let lexicons = await this.getLexicons();
    console.log(lexicons);
  }
}

const setup = false;

const awsSetup = new AwsSetup();

if (setup) {
  awsSetup.init()
    .then(() => {
      console.log('Success')
    })
    .catch(e => {
      console.log('Error', e)
    });
} else {
  awsSetup.check();
}
