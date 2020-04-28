module.exports = function(filePath, outputdir) {
    //const {unpack, defaultArgs} = require('@shelf/aws-lambda-libreoffice');
    //await unpack({inputPath: INPUT_PATH});
    //await unpack(); // default path /tmp/instdir/program/soffice.bin
    console.log('convert is called')
    console.log(filePath)
    var execSync = require("child_process").execSync;

    execSync(
      `sudo /usr/local/bin/soffice --convert-to pdf ${filePath} --outdir ${outputdir}`
    );
    console.log('converted at', outputdir)
    return outputdir;
};
