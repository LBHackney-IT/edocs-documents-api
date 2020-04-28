module.exports = async function(fileName) {
    var soffice = '/usr/local/bin/soffice'

    if (process.env.ENV === 'staging' || process.env.ENV === 'production') {
      const {unpack, defaultArgs} = require('@shelf/aws-lambda-libreoffice');
      await unpack(); // default path /tmp/instdir/program/soffice.bin
      soffice = '/tmp/instdir/program/soffice.bin'
    }

    var execSync = require("child_process").execSync;

    execSync(
      `${soffice} --headless --convert-to pdf /tmp/${fileName} --outdir /tmp`
    );
};
