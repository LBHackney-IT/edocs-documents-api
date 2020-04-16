const mimeTypes = require("mime-types");

module.exports = function(options) {
  const edocsGateway = options.edocsGateway;
  // const s3Gateway = options.s3Gateway;

  return async function(documentId) {
    const outputDoc = await edocsGateway.getDocument(documentId);
    const mimeType = mimeTypes.extension(outputDoc.headers["content-type"]);

    // Cash into an S3 bucket:
    // s3Gateway.put(documentId, outputDoc)

    // TODO: return doc url from bucket:
    return {
      mimeType,
      doc: outputDoc.body,
      filename: `${documentId}.${mimeType}`
    };
  };
};
