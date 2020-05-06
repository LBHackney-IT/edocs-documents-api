module.exports = function({ dbGateway }) {
  return function(documentId, userName, userEmail) {
    const accessTime = new Date();
    dbGateway.createAccessLog(documentId, userName, userEmail, accessTime);
  };
};
