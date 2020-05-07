const GetDocument = require('../../lib/use-cases/GetDocument');
const fs = require("fs");

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

const createConverterSpy = (fileName, sofficePromise) => {
  return {
    execute: jest.fn((fileName, sofficePromise) => {
      const convertedFileName = fileName.replace(/\.[^/.]+$/, "") + ".pdf"
      fs.renameSync(`/tmp/${fileName}`,   `/tmp/${convertedFileName}`)
      return convertedFileName
  })
  }
};

describe('GetDocument', function() {
  it('return null if document does not exist', async function() {
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

  it('calls converter for .doc extension', async function() {
    const cachedDocumentId = 2;
    const cachedDocument = 'cached document';
    const edocsGatewaySpy = createEdocsGatewaySpy(cachedDocument, 'application/msword');
    const s3GatewaySpy = createS3GatewaySpy()
    const converterSpy = createConverterSpy()
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: s3GatewaySpy, converter: converterSpy });
  
    const attachment = await usecase(cachedDocumentId, null);
    
    expect(s3GatewaySpy.get).toHaveBeenCalledTimes(1);
    expect(s3GatewaySpy.get).toHaveBeenCalledWith(cachedDocumentId);
    expect(converterSpy.execute).toHaveBeenCalledTimes(1)
    expect(converterSpy.execute).toHaveBeenCalledWith('2.doc', null)
    expect(attachment.doc.toString()).toBe(cachedDocument);
    expect(attachment.url).toBe('http://dummy-url.com/?')
    expect(attachment.extension).toBe('pdf')
  });

  it('does not call converter for unsupported extension', async function() {
    const documentId = 3;
    const document = 'document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'application/x-tar');
    const s3GatewaySpy = createS3GatewaySpy()
    const converterSpy = createConverterSpy()
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: s3GatewaySpy, converter: converterSpy });

    await expect(usecase(documentId, null)).rejects.toEqual(new Error('This document cannot be viewed in your browser, please open in Mosaic on VDI.'))
  });

  it('does not call converter for web native extension', async function() {
    const documentId = 4;
    const document = 'document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'application/pdf');
    const s3GatewaySpy = createS3GatewaySpy()
    const converterSpy = createConverterSpy()
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: s3GatewaySpy, converter: converterSpy });
    
    const attachment = await usecase(documentId, null);

    expect(s3GatewaySpy.get).toHaveBeenCalledTimes(1);
    expect(s3GatewaySpy.get).toHaveBeenCalledWith(documentId);
    expect(converterSpy.execute).toHaveBeenCalledTimes(0)

    expect(attachment.doc.toString()).toBe(document);
    expect(attachment.url).toBe('http://dummy-url.com/?')
    expect(attachment.extension).toBe('pdf')
  });

  it('does call converter for ppt extension', async function() {
    const documentId = 4;
    const document = 'document';
    const edocsGatewaySpy = createEdocsGatewaySpy(document, 'application/vnd.ms-powerpoint');
    const s3GatewaySpy = createS3GatewaySpy()
    const converterSpy = createConverterSpy()
    const usecase = GetDocument({ edocsGateway: edocsGatewaySpy, s3Gateway: s3GatewaySpy, converter: converterSpy });
    
    const attachment = await usecase(documentId, null);

    expect(s3GatewaySpy.get).toHaveBeenCalledTimes(1);
    expect(s3GatewaySpy.get).toHaveBeenCalledWith(documentId);
    expect(converterSpy.execute).toHaveBeenCalledTimes(1)
    expect(converterSpy.execute).toHaveBeenCalledWith('4.ppt', null)
    expect(attachment.doc.toString()).toBe(document);
    expect(attachment.url).toBe('http://dummy-url.com/?')
    expect(attachment.extension).toBe('pdf')
  });
})
 