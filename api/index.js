require('dotenv').config();
const edocsGateway = require('./lib/gateways/EdocsGateway')({
  edocsServerUrl: process.env.EDOCS_API_URL
});

const getDocument = require('./lib/use-cases/GetDocument')({
  edocsGateway: edocsGateway, s3Gateway: null
});

const getDoc = async (event) => {
  
  try {
    const { mimeType, doc, filename } = await getDocument(event.pathParameters.documentId);

    const response = {
      statusCode: 200,
      headers: {
          "Content-Type": mimeType
      },
      body: doc.toString()
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
