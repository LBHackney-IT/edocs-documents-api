require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const aws = require('aws-sdk');
const authorizer = require('node-lambda-authorizer')({ 
  jwtSecret: process.env.jwtsecret, 
  allowedGroups: process.env.allowedGroups.split(",") 
});
const dbConfig = require('./lib/DynamoDbConfig')(process.env);
const dbGateway = require('./lib/gateways/DynamoDbGateway')(dbConfig);
const logDocumentAccess = require('./lib/use-cases/LogDocumentAccess')({ dbGateway })

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

app.get('/documents/:documentId', async (req, res) => {
  const documentId = req.params.documentId.split('&')[0]

  res.set('Cache-Control', 'no-store, no-cache')
  res.set('Pragma', 'no-cache')

  try {
    doc = await getDocument(documentId, sofficePromise)

    if (!doc.url) {
      res.status(404)
      res.send('Requested document does not exist')
      return
    }
    const payload = authorizer.getTokenPayload(req)

    if (payload && payload.name && payload.email) {
      await logDocumentAccess(documentId, payload.name, payload.email)
      res.status(301)
      res.set('Location', doc.url)
      res.send('')
    } else {
      res.status(400)
      res.send("Couldn't find name and email in request")
    }
  } catch (err) {
    console.log(err)
    res.status(500)
    res.send(err.toString())
  }

});

app.get('/LbhMosaicEDocs/DocumentMenu.aspx', async (req, res) => {

  var permission = await authorizer.handler(req)

  if(permission === 'Not Allowed') {
    res.status(403)
    return res.send("You don't have permission to use this service, please contact a google admin to see if you are in the correct usergroup")
  }

  if(permission === 'Unauthorized') {
    
    const fullUrl= process.env.redirectUri + req.originalUrl

    return res.redirect(`${process.env.googleAuthRedirectUri}${fullUrl}`)
  }

  const documentId = req.query.documentId
  res.redirect(`/documents/${documentId}`)
})

module.exports.handler = serverless(app, {
  binary: ['*/*']
});
