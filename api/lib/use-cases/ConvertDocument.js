module.exports = function(fileName, sofficePromise) {
    var execSync = require("child_process").execSync;
    sofficePromise.then((path) => {
      const cmd = `${path} --convert-to pdf /tmp/${fileName} --outdir /tmp`
    var logs

    try {
      logs = execSync(cmd);
    } catch (e) {
      logs = execSync(cmd);
    }

    console.log(logs.toString('utf8'))
    }
  )
};

