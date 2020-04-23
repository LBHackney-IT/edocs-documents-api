const mimeTypes = require("mime-types");

module.exports = function(options) {
  const edocsGateway = options.edocsGateway;
  const s3Gateway = options.s3Gateway;

  return async function(documentId) {
    let doc = await s3Gateway.get(documentId);

    if (!doc) {
      const outputDoc = await edocsGateway.getDocument(documentId);

      console.log("statuscode: ", outputDoc.statusCode);
      console.log(outputDoc);

      if (outputDoc.statusCode != 200) {
        console.log(`Error: couldn't find document with id: ${documentId}`);
        return null;
      }

      const mimeType = outputDoc.headers["content-type"]
      const extension = mimeTypes.extension(mimeType)

      doc = {
        mimeType,
        extension,
        doc: outputDoc.body,
        filename: `${documentId}.${extension}`
      };

      await s3Gateway.put(documentId, doc);
    }

    doc.url = await s3Gateway.getUrl(documentId, doc.mimeType, doc.extension);

    return doc;
  };
};
