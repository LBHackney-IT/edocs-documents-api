module.exports = async function(fileName, sofficePromise) {
    var execSync = require("child_process").execSync;
    var promise = sofficePromise.then((path) => {
      const cmd = `${path} --convert-to pdf /tmp/${fileName} --outdir /tmp`
    var logs
    
    console.log(cmd)
    try {
      logs = execSync(cmd);
    } catch (e) {
      logs = execSync(cmd);
    }

    console.log(logs.toString('utf8'))
    
    }
  ).then(() => {return fileName.replace(/\.[^/.]+$/, "") + ".pdf"});
  return promise
};