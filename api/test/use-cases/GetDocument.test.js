const GetDocument = require('../../lib/use-cases/GetDocument');

const createEdocsGatewaySpy = (document, contentType) => {
    return {
      getDocument: jest.fn(() => {
        return {
          headers: {'content-type': contentType},
          body: document
        }
      })
    };
  };

const createS3GatewaySpy = document => {
  //TODO Spy on S3 put request
  return {
    put: jest.fn(() => {
      return 'http://dummy-url.com/?';
    })
  };
}

describe('GetDocument', function() {
  it.only('gets the right content', async function() {
    const documentId = 1234;
    const document = 'some document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'text/xml');
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: null });
    const attachment = await usecase(documentId);

    expect(edocsGatewaySpy.getDocument).toHaveBeenCalledTimes(1);
    expect(attachment.doc).toBe(document);
    expect(attachment.mimeType).toBe('xml')
    expect(attachment.filename).toBe('1234.xml')
  });
})
 