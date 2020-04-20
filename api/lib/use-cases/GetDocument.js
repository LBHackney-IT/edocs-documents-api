const mimeTypes = require("mime-types");

module.exports = function(options) {
  const edocsGateway = options.edocsGateway;
  const s3Gateway = options.s3Gateway;

  return async function(documentId) {
    const outputDoc = await edocsGateway.getDocument(documentId);
    const mimeType = mimeTypes.extension(outputDoc.headers["content-type"]);
    doc = {
      mimeType,
      doc: outputDoc.body,
      filename: `${documentId}.${mimeType}`
    }
    
    // Cash into an S3 bucket:
    await s3Gateway.put(documentId, doc)

    doc.url = await s3Gateway.getUrl(documentId, doc.mimeType, doc.mimeType)
    // TODO: return doc url from bucket:
    return doc;
  };
};
