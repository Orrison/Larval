const execute = window.require('child_process').exec

export const vagrantGStatus = (callback) => {
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