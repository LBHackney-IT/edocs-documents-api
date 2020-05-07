const mimeTypes = require("mime-types");
const fs = require("fs");
const selectFileAction = require('./SelectFileAction')
function saveFileLocally(docBody, fileName) {
  try {
    fs.writeFileSync(`/tmp/${fileName}`, docBody);
    console.log("The file has been saved!");
  } catch (err) {
    console.log(err);
    console.log("File not saved");
    throw err;
  }
  return fileName;
}

module.exports = function(options) {
  const edocsGateway = options.edocsGateway;
  const s3Gateway = options.s3Gateway;
  const convertDocument = options.converter;

  return async function(documentId, sofficePromise) {
    let doc = await s3Gateway.get(documentId);

    if (!doc) {
      var outputDoc;

      try {
        outputDoc = await edocsGateway.getDocument(documentId);
        console.log(`Document with id: ${documentId} fetched from edocs gateway`);
      } catch (err) {
        console.log(`Document with id: ${documentId} not found in edocs`);
        throw err;
      }

      if (outputDoc.statusCode != 200) return null;

      var mimeType = outputDoc.headers["content-type"];
      var extension = mimeTypes.extension(mimeType);

      var document = outputDoc.body;

      const fileAction = selectFileAction(extension)
      
      if (fileAction === 'unsupported') {
        throw new Error('This document cannot be viewed in your browser, please open in Mosaic on VDI.')
      }

      if (fileAction === 'convert') {
        var fileName = saveFileLocally(
          document,
          `${documentId}.${extension}`
        );

        try {
          fileName = await convertDocument.execute(fileName, sofficePromise);
          console.log("File converted successfully");
        } catch (err) {
          console.log(err);
          console.log("File not converted");
          throw err;
        }

        extension = fileName.split(".").pop();

        try {
          document = fs.readFileSync(`/tmp/${fileName}`);

          mimeType = "application/pdf";
        } catch (err) {
          console.log(err);
          console.log("File not read");
          throw err;
        }
      }
      doc = {
        mimeType,
        extension,
        doc: document,
        filename: `${documentId}.${extension}`
      };

      await s3Gateway.put(documentId, doc);
    }

    doc.url = await s3Gateway.getUrl(documentId, doc.mimeType, doc.extension);

    return doc;
  };
};
