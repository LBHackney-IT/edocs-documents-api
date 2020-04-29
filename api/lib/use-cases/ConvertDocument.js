module.exports = function(fileName, soffice) {
    var execSync = require("child_process").execSync;
    const cmd = `${soffice} --convert-to pdf /tmp/${fileName} --outdir /tmp`
    var logs

    try {
      logs = execSync(cmd);
    } catch (e) {
      logs = execSync(cmd);
    }

    console.log(logs.toString('utf8'))
};

