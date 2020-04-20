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
    const { mimeType, doc, filename } = await getDocument(event.pathParameters.documentId);

    const response = {
      statusCode: 200,
      headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`
      },
      body: doc.toString('base64'),
      isBase64Encoded: true
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
