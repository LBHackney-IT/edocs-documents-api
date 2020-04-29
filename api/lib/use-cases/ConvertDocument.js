module.exports = async function(fileName) {
    var soffice = '/usr/local/bin/soffice'

    if (process.env.stage === 'staging' || process.env.stage === 'production') {
      const INPUT_PATH = '/opt/lo.tar.br';
      const {unpack, defaultArgs} = require('@shelf/aws-lambda-libreoffice');
      await unpack({inputPath: INPUT_PATH}); // default path /tmp/instdir/program/soffice.bin
      soffice = '/tmp/instdir/program/soffice.bin'

    }

    var execSync = require("child_process").execSync;
    var tmpContents = execSync(
      'cd /tmp && ls'
    ).toString()
    console.log(tmpContents)
    execSync(
      `${soffice} --headless --convert-to pdf /tmp/${fileName} --outdir /tmp`
    );
};

