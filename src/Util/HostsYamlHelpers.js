const electron = window.require('electron')
const { remote } = electron
const { app } = remote
const execute = window.require('child_process').exec
const timestamp = require('time-stamp')

/*
* Provided with a path the the homestead server save a backup of the Homestead.yaml file to the users documents folder
*/
export const homesteadYamlBackup = (homesteadPath) => {
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
        name: 'Larval',
    }

    execute(`cp ${homesteadPath}/Homestead.yaml ${app.getPath('documents')}/Homestead.yaml.${time}.larval.bak`, options,
        (error, stdout, stderr) => {
          if (error) {
            console.log(`stdout: ${error}`)
            console.log(`stdout: ${stderr}`)
          }
    })
}