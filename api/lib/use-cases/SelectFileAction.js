module.exports = function(fileExtension) {
  const responses = {
    UNSUPPORTED: 'unsupported',
    CONVERT: 'convert',
    WEBNATIVE: 'web native'
  }
  const libreOfficeSupportedFileExtensions = ['doc', 'docx', 'ppt' , 'pptx' , 'xls' , 'xlsx' , 'numbers' , 'pages' , 'key' , 'csv' , 'txt', 'odt' , 'ods' , 'odt' , 'odp' , 'rtf' , 'xlt' , 'psd', 'cdr' , 'eps' , 'psw' , 'dot' , 'tiff']
  
  const webNativeFileExtensions = ['pdf', 'apng', 'bmp', 'gif', 'ico', 'cur', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'xml']
  
  if (libreOfficeSupportedFileExtensions.includes(fileExtension)) {
    return responses.CONVERT
  } else if (webNativeFileExtensions.includes(fileExtension)) {
    return responses.WEBNATIVE
  }
  return responses.UNSUPPORTED
}