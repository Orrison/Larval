const electron = require('electron')
const { remote } = electron
const { app } = remote
const execute = require('child_process').exec
const timestamp = require('time-stamp')

/*
* Provided with a path the the homestead server save a backup of the Homestead.yaml file to the users documents folder
*/
export const homesteadYamlBackup = (homesteadPath) => {
    const time = timestamp('YYYYMMDDHHmmss')
    const options = {
        name: 'Larval',
    }
    const docPath = app.getPath('documents')

    execute(`cd ${docPath} && mkdir -p larvalbackup && cp ${homesteadPath}/Homestead.yaml ${docPath}/larvalbackup/Homestead.yaml.${time}.larval.bak`, options,
        (error, stdout, stderr) => {
          if (error) {
            if (error) throw error
          }
    })
}