module.exports = function(options) {

   return async function(filePath,outputdir) {
           //const {unpack, defaultArgs} = require('@shelf/aws-lambda-libreoffice');
    //await unpack({inputPath: INPUT_PATH});
    //await unpack(); // default path /tmp/instdir/program/soffice.bin
       var execSync = require('child_process').execSync;
       
       execSync(
           `/usr/local/bin/soffice --convert-to pdf ${filePath} --outdir ${outputdir}`
           );
        return outputdir;
   };

};