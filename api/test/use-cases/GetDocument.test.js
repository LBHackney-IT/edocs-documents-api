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
  return {
    put: jest.fn(() => {
      return {
        promise: () => {
          return Promise.resolve;
        }
      };
    }),
    getUrl: jest.fn(() => {
      return 'http://dummy-url.com/?';
    })
  };
}


describe('GetDocument', function() {
  it('gets the right content', async function() {
    const documentId = 1234;
    const document = 'some document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'text/xml');
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: createS3GatewaySpy()});
    const attachment = await usecase(documentId);

    expect(edocsGatewaySpy.getDocument).toHaveBeenCalledTimes(1);
    expect(attachment.doc).toBe(document);
    expect(attachment.mimeType).toBe('xml')
    expect(attachment.filename).toBe('1234.xml')
  });

  it('caches into an S3 bucket and returns the URL from S3', async function() {
    const documentId = 1234;
    const document = 'some document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'text/xml');
    const s3GatewaySpy = createS3GatewaySpy()
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: s3GatewaySpy });
  
    const attachment = await usecase(documentId);
    
    expect(edocsGatewaySpy.getDocument).toHaveBeenCalledTimes(1);
    // expect(s3GatewaySpy.put).toHaveBeenCalledWith(documentId, {
    //   mimeType: 'xml',
    //   doc: document,
    //   filename: '1234.xml',
    // });
    expect(attachment.doc).toBe(document);
    expect(attachment.url).toBe('http://dummy-url.com/?')
  });
})
 