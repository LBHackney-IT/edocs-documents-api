const GetDocument = require('../../lib/use-cases/GetDocument');

const createEdocsGatewaySpy = (document, contentType, statusCode) => {
    return {
      getDocument: jest.fn(() => {
        return {
          statusCode: statusCode || 200,
          headers: {'content-type': contentType},
          body: document
        }
      })
    };
  };

const createS3GatewaySpy = document => {
  return {
    get: jest.fn((id) => {
      if (id === 1) {
        return {
          doc: 'cached document',
          mimeType: 'text/xml',
          extension: 'xml',
          url: 'www.cachedDocumentUrl.com'
        }
      }
      return null;
    }),
    put: jest.fn(() => {
      return {
        promise: () => {
          return Promise.resolve;
        }
      };
    }),
    getUrl: jest.fn((id) => {
      if (id === 1) {
        return 'www.cachedDocumentUrl.com'
        } 
      return 'http://dummy-url.com/?';
    })
  };
}


describe('GetDocument', function() {
  it('gets the right content', async function() {
    const edocsGatewaySpy = createEdocsGatewaySpy(null, null, 404);
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: createS3GatewaySpy()});
    const attachment = await usecase(0);

    expect(edocsGatewaySpy.getDocument).toHaveBeenCalledTimes(1);
    expect(attachment).toBe(null);
  });

  it('gets the right content', async function() {
    const documentId = 1234;
    const document = 'some document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'text/xml');
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: createS3GatewaySpy()});
    const attachment = await usecase(documentId);

    expect(edocsGatewaySpy.getDocument).toHaveBeenCalledTimes(1);
    expect(attachment.doc).toBe(document);
    expect(attachment.mimeType).toBe('text/xml')
    expect(attachment.extension).toBe('xml')
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
    expect(s3GatewaySpy.put).toHaveBeenCalledTimes(1);
    expect(attachment.doc).toBe(document);
    expect(attachment.url).toBe('http://dummy-url.com/?')
  });

  it('returns cached document if already in an S3 bucket', async function() {
    const cachedDocumentId = 1;
    const cachedDocument = 'cached document';
    const edocsGatewaySpy = createEdocsGatewaySpy(cachedDocument, 'text/xml');
    const s3GatewaySpy = createS3GatewaySpy()
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: s3GatewaySpy });
  
    const attachment = await usecase(cachedDocumentId);
    
    expect(s3GatewaySpy.get).toHaveBeenCalledTimes(1);
    expect(s3GatewaySpy.get).toHaveBeenCalledWith(cachedDocumentId);
    expect(attachment.doc).toBe(cachedDocument);
    expect(attachment.url).toBe('www.cachedDocumentUrl.com')
  });
})
 