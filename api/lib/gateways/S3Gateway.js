module.exports = function(options) {
  const s3 = options.s3;

  return {
    get: async function(id) {
      if (process.env.DISABLE_CACHE === 'true') return;
      try {
        const response = await s3
          .getObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}`
          })
          .promise();
        if (response) {
          console.log(`Got doc id=${id} from s3`);
          return {
            doc: response.Body,
            mimeType: response.Metadata.mimetype
          };
        }
      } catch (err) {
        if (err.code !== 'NoSuchKey') console.log(err);
      }
    },
    getUrl: async function(id, mimeType, extension) {
      try {
        const requestParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${id}`,
          ResponseContentType: mimeType
        };
        if (extension) {
          requestParams.ResponseContentDisposition = `attachment; filename ="${id}.${extension}"`;
        }

        return await s3.getSignedUrl('getObject', requestParams);
      } catch (err) {
        if (err.code !== 'NoSuchKey') console.log(err);
      }
    },
    put: async function(id, document) {
      if (process.env.DISABLE_CACHE === 'true') return;
      try {
        const response = await s3
          .putObject({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${id}`,
            Body: document.doc,
            Metadata: { mimetype: document.mimeType }
          })
          .promise();
        if (response.data) {
          console.log(`Put doc id=${id} into s3`);
          return response.data;
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
};
