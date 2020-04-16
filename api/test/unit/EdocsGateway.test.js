jest.mock('request-promise');
const request = require('request-promise');
const edocsServerUrl = 'http://dummy-url.com/?';
const fs = require('fs');
const gateway = require('../../lib/gateways/EdocsGateway')({
  edocsServerUrl
});

describe('EdocsGateway', function() {
  it('makes the correct request and returns the response', async function() {
    const id = 123;
    const dummyContent = 'content';
    request.get.mockReturnValue(Promise.resolve(dummyContent));

    const response = await gateway.getDocument(id);

    expect(request.get).toHaveBeenCalledTimes(1);
    expect(request.get).toHaveBeenCalledWith({
      url: `${edocsServerUrl}${id}`,
      encoding: null,
      resolveWithFullResponse: true
    });
    expect(response).toBe(dummyContent);
  });
});
