require('dotenv').config();
const AWS = require('aws-sdk');
const edocsGateway = require('./lib/gateways/EdocsGateway')({
  edocsServerUrl: process.env.EDOCS_API_URL
});
const s3Gateway = require('./lib/gateways/S3Gateway')({
  s3: new AWS.S3()
});

const getDocument = require('./lib/use-cases/GetDocument')({
  edocsGateway: edocsGateway, s3Gateway: s3Gateway
});

const getDoc = async (event) => {
  
  try {
    const { _mimeType, _doc, _filename, url } = await getDocument(event.pathParameters.documentId);
    const response = {
      statusCode: 301,
      headers: {
          'Location': url
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
