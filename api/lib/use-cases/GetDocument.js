const mimeTypes = require("mime-types");
const fs = require("fs");

//TODO: get better name for this func
function saveFileLocally(docBody, fileName) {
  try {
    fs.writeFileSync(`/tmp/${fileName}`, docBody);
    console.log("The file has been saved!");
  } catch (err) {
    console.log(err)
    console.log('File not saved')
    throw(err)
  }
  return fileName;
}

var soffice = '/usr/local/bin/soffice'

function unpackLibreOffice() {
  console.log('Starting to unpack libreoffice')
  const INPUT_PATH = '/opt/lo.tar.br';
  const {unpack, defaultArgs} = require('@shelf/aws-lambda-libreoffice');
  unpack({inputPath: INPUT_PATH}); // default path /tmp/instdir/program/soffice.bin
  console.log('libreoffice unpacked')

  return '/tmp/instdir/program/soffice.bin'
}

if (process.env.stage === 'staging' || process.env.stage === 'production') {
  soffice = unpackLibreOffice()
}

const convertDocument = require("./ConvertDocument");

module.exports = function(options) {
  const edocsGateway = options.edocsGateway;
  const s3Gateway = options.s3Gateway;

  return async function(documentId) {
    let doc = await s3Gateway.get(documentId);

    if (!doc) {
      try {
        const outputDoc = await edocsGateway.getDocument(documentId);
        
        if (outputDoc.statusCode != 200) return null;

        var mimeType = outputDoc.headers["content-type"];
        var extension = mimeTypes.extension(mimeType);

        console.log('From edocs retrieved:', `${documentId}.${extension}`)

        var document = outputDoc.body

        if (extension === 'doc'|| extension === 'docx') {
          
          fileName = saveFileLocally(
            document,
            `${documentId}.${extension}`
          );

          try {
            await convertDocument(fileName, soffice);
            console.log('File converted successfully')
          } catch (err) {
            console.log(err)
            console.log('File not converted')
            throw(err)
          }
          
          extension = 'pdf'

          try {
          document = fs.readFileSync(
            `/tmp/${documentId}.${extension}`
          );

          mimeType = 'application/pdf'
          
        } catch (err) {
            console.log(err)
            console.log('File not read')
            throw(err)
          }
        }
        doc = {
          mimeType,
          extension,
          doc: document,
          filename: `${documentId}.${extension}`
        };

        await s3Gateway.put(documentId, doc);
      } catch (err) {
        console.log(`Error: couldn't find document with id: ${documentId}`);
        console.log(err);
        return null;
      }
    }

    doc.url = await s3Gateway.getUrl(documentId, doc.mimeType, doc.extension);

    return doc;
  };
};
