const GetAttachment = require('@lib/use-cases/GetDocument');


const createEdocsGateway = document => {
    return {
      getDocument: jest.fn(() => {
        return document;
      })
    };
  };

const createS3Gateway = document => {
  return {
    put: jest.fn(() => {
      return 'http://dummy-url.com/?';
    })
  };
}



  it('gets the edocs document', async function() {
    const documentId = 1234;
    const document = 'some document';
    const stubEdocsGateway = createEdocsGateway(document);
    const s3Gateway = createS3Gateway()
    const usecase = GetDocument({ stubEdocsGateway, s3Gateway });

    const attachment = await usecase(imageId);

    expect(dbGateway.getEmailAttachmentMetadata).toHaveBeenCalledTimes(1);
    expect(imageServerGateway.getDocument).toHaveBeenCalledTimes(1);

    expect(attachment.doc).toBe(document);
    expect(attachment.filename).toBe('Scanned.pdf');
    expect(attachment.mimeType).toBe('application/pdf');
  });