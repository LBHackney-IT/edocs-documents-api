require("dotenv").config();

const request = require("request-promise");

module.exports = function(config) {
  return {
    getDocument: async function(id) {
      return await request.get({
        url: `${config.edocsServerUrl}${id}`,
        encoding: null,
        resolveWithFullResponse: true,
        headers: { authorization: "Bearer " + config.apiKey }
      });
    }
  };
};
