const SelectFileAction = require('../../lib/use-cases/SelectFileAction');

describe('SelectFileAction', function() {
  it("returns 'unsupported' when file extension isn't supported", async function() {
    const fileExtension = 'unsupportedFileType' 
    const result = SelectFileAction(fileExtension);

    expect(result).toBe('unsupported');
  });

  it("returns 'convert' when file extension can and needs to be converted", async function() {
    const fileExtension = 'doc' 
    const result = SelectFileAction(fileExtension);
    expect(result).toBe('convert');
  });

  it("returns 'convert' when file extension can and needs to be converted", async function() {
    const fileExtension = 'docx' 
    const result = SelectFileAction(fileExtension);
    expect(result).toBe('convert');
  });

  it("returns 'convert' when file extension can and needs to be converted", async function() {
    const fileExtension = 'tiff' 
    const result = SelectFileAction(fileExtension);
    expect(result).toBe('convert');
  });

  it("returns 'web native' when file extension doesn't need to be converted", async function() {
    const fileExtension = 'pdf' 
    const result = SelectFileAction(fileExtension);
    expect(result).toBe('web native');
  });

  it("returns 'web native' when file extension doesn't need to be converted", async function() {
    const fileExtension = 'jpeg' 
    const result = SelectFileAction(fileExtension);
    expect(result).toBe('web native');
  });
})