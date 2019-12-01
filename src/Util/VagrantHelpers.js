const { exec, spawn } = require('child_process')

export const getVagrantID = (callback) => {
  exec('vagrant global-status --prune',
    (error, stdout, stderr) => {
      if (error) throw error
      // const vGlobalID = stdout.match("/\-\n([\s\S]*?)(?=\s)/g")

      /* eslint-disable-next-line */
      const regex = /\-\n([\s\S]*?)(?=\s)/gm // es-lint-disable
      let m

      /* eslint-disable-next-line */
      while ((m = regex.exec(stdout)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++ // eslint-disable-line
        }
        callback(m[1])
      }
    })
}

export const vagrantSSH = (id) => {
  if (window.process.platform === 'darwin') {
    exec(`osascript -e 'tell application "Terminal" to activate' -e 'tell application "Terminal" to do script "vagrant ssh ${id}"'`)
  }
}

export const boxScan = () => {
    const find = spawn('find', ['/Users', '-name', 'Homestead.yaml'])
    
    find.stdout.on('data', (data) => {
    //   console.log(data.toString())
      let split = data.toString().split(/\r?\n/)
      console.log(split)
    })

    find.on('exit', function (code, signal) {
        console.log('child process exited with ' + `code ${code} and signal ${signal}`)
    });
}
