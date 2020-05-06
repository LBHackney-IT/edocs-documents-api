const logDocumentAccess = require('../../lib/use-cases/LogDocumentAccess');

const createDbGatewaySpy = () => {
  return {
    createAccessLog: jest.fn(() => {
      return
    })
  }
}

describe('LogDocumentAccess', function() {
  it('create an access log', async function() {
    const documentId = 1
    const userName = 'test'
    const userEmail = 'test@test.com'
    const dbGatewaySpy = createDbGatewaySpy()
    logDocumentAccess({ dbGateway: dbGatewaySpy })(documentId, userName, userEmail)
    expect(dbGatewaySpy.createAccessLog).toHaveBeenCalledTimes(1)
    expect(dbGatewaySpy.createAccessLog).toHaveBeenCalledWith(documentId, userName, userEmail, expect.any(Date))
  });
});