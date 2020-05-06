const createDynamoDbSpy = () => {
  return {
    put: jest.fn().mockResolvedValue({promise: 'test promise'})
  }
}

const dynamoDbSpy = createDynamoDbSpy()
const dbGateway = require('../../lib/gateways/DynamoDbGateway')({ client: dynamoDbSpy, tables: {accessLogsTable: 'test table'} })

describe('DynamoDbGateway', function() {
  it('create an access log', async function() {
    const documentId = 1
    const userName = 'test'
    const userEmail = 'test@test.com'
    const accessTime = new Date()

    dbGateway.createAccessLog(documentId, userName, userEmail, accessTime)
    expect(dynamoDbSpy.put).toHaveBeenCalledTimes(1)
    expect(dynamoDbSpy.put).toHaveBeenCalledWith({ TableName: 'test table', Item: { documentId, accessTime: accessTime.toISOString(), userName, userEmail}})
  });
});