const aws = require("aws-sdk");

module.exports = env => {
  const dbConfig = {};
  const tables = {
    accessLogsTable: env.ACCESS_LOGS_TABLE
  };

  if (env.STAGE === "dev" || env.STAGE === "test") {
    dbConfig.region = "localhost";
    dbConfig.endpoint = "http://localhost:8000";
    dbConfig.accessKeyId = "AWS_ACCESS_KEY_ID";
    dbConfig.secretAccessKey = "AWS_SECRET_ACCESS_KEY";
  } else if (env.JEST_WORKER_ID) {
    dbConfig.region = "localhost";
    dbConfig.endpoint = "http://localhost:8100";
    dbConfig.sslEnabled = false;
    dbConfig.accessKeyId = "AWS_ACCESS_KEY_ID";
    dbConfig.secretAccessKey = "AWS_SECRET_ACCESS_KEY";
  }

  const client = new aws.DynamoDB.DocumentClient(dbConfig);

  return { client, tables };
};
