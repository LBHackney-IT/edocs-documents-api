const request = require("request-promise");

module.exports = function(config) {
  return {
    getDocument: async function(id) {
      console.log("Endpoint:");
      console.log(`${config.edocsServerUrl}${id}`);

      return await request.get({
        url: `${config.edocsServerUrl}${id}`,
        encoding: null,
        resolveWithFullResponse: true,
        headers: { authorization: 'Bearer ' + process.env.DOTNET_API_KEY }
      });
    }
  };
};
