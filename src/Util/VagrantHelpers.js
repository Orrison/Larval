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
  if (window.process.platform === 'darwin') {
    execute(`osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down' -e 'tell application "System Events" to tell process "Terminal" to keystroke "vagrant ssh ${id}"' -e 'tell application "System Events" to tell process "Terminal" to keystroke return'`)
  } else if (window.process.platform === 'win32') {

  }
  // execute(`osascript -e 'tell application "iTerm" to create window with default profile' -e 'tell application "System Events" to tell process "iTerm" to keystroke "vagrant ssh"' -e 'tell application "System Events" to tell process "iTerm" to keystroke return'`)
}