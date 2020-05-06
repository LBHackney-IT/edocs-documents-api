module.exports = function({ client, tables }) {
  return {
    createAccessLog: async function(
      documentId,
      userName,
      userEmail,
      accessTime
    ) {
      try {
        await client
        .put({
          TableName: tables.accessLogsTable,
          Item: {
            documentId,
            accessTime: accessTime.toISOString(),
            userName,
            userEmail
          }
        })
        .promise();
      } catch (err) {
        console.log(err)
      }
      
    }
  };
};
