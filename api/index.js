require('dotenv').config();
const aws = require('aws-sdk');
const edocsGateway = require('./lib/gateways/EdocsGateway')({
  edocsServerUrl: process.env.EDOCS_API_URL,
  apiKey: process.env.EDOCS_API_KEY
});

var s3Gateway

try {
   s3Gateway= require('./lib/gateways/S3Gateway')({
    s3: new aws.S3()
   });
} catch (err) {
  console.log(err)
  console.log('s3 not created')
  throw(err)
}

const convertDocument = require("./lib/use-cases/ConvertDocument")();

const getDocument = require('./lib/use-cases/GetDocument')({
  edocsGateway: edocsGateway, s3Gateway: s3Gateway, converter: convertDocument
});

async function localLibreOffice() {
  return '/usr/local/bin/soffice'
}

async function unpackLibreOffice() {
  console.log('Starting to unpack libreoffice')
  const INPUT_PATH = '/opt/lo.tar.br';
  const {unpack, defaultArgs} = require('@shelf/aws-lambda-libreoffice');
  await unpack({inputPath: INPUT_PATH}); // default path /tmp/instdir/program/soffice.bin
  console.log('libreoffice unpacked')

  return '/tmp/instdir/program/soffice.bin'
}

const isDev = !(process.env.stage === "staging" || process.env.stage === "production")

const sofficePromise = isDev ? localLibreOffice() : unpackLibreOffice();

const getDoc = async (event) => {
  try {
    const doc = await getDocument(event.pathParameters.documentId, sofficePromise);

    if (!doc) return { statusCode: 404, body: 'Requested document does not exist' }

    const { _mimeType, _doc, _filename, url } = doc
    
    const response = {
      statusCode: 301,
      headers: {
          'Location': url,
          'Cache-Control': 'no-store, no-cache',
          'Pragma': 'no-cache'
      },
      body: ''
    };
    return response;
  } catch (err) {
    console.log(err);

    const response = {
      statusCode: 500,
      body: err
    };
    return response;
  }
}

module.exports = {
  getDoc
}
