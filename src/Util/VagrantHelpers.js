const execute = window.require('child_process').exec
const spawn = window.require('child_process').spawn

export const getVagrantID = (callback) => {
    execute(`vagrant global-status --prune`,
      (error, stdout, stderr) => {
        if (error) throw error
        // const vGlobalID = stdout.match("/\-\n([\s\S]*?)(?=\s)/g")

        const regex = /\-\n([\s\S]*?)(?=\s)/gm
        let m

        while ((m = regex.exec(stdout)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++
            }
            callback(m[1])
        }
      }
    )
}

export const vagrantSSH = (id) => {
  let openTerminalAtPath = spawn(`vagrant ssh ${id}`, {shell:true})

  openTerminalAtPath.stdout.on('data', function (data) {
    console.log('stdout: ' + data)
  })
  
  openTerminalAtPath.stderr.on('data', function (data) {
    console.log('stderr: ' + data)
  })
  
  openTerminalAtPath.on('exit', function (code) {
    console.log('child process exited with code ' + code)
  })

  openTerminalAtPath.stdin.setEncoding('utf-8')

  openTerminalAtPath.stdin.write("ls\n")

  openTerminalAtPath.stdin.end()
}