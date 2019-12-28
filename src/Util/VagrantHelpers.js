const { exec, spawn } = require('child_process')
import Swal from 'sweetalert2'

const settings = require('electron-settings')

export const getIdFromPath = (path, callback) => {
    exec('vagrant global-status',
      (error, stdout, stderr) => {
        if (error) console.log(error)

        path = path.split('/').join('\\/')
        var regex = new RegExp(`(?<=\\n)(\\w*)(?=\\s)(?=.*${path})`);
        let m = regex.exec(stdout)
        callback(m[0])
      })
  }

export const vagrantSSH = (id) => {
  if (window.process.platform === 'darwin') {
    exec(`osascript -e 'tell application "Terminal" to activate' -e 'tell application "Terminal" to do script "vagrant ssh ${id}"'`)
  }
}

export const boxScan = cb => {
    Swal.fire({
        title: 'Scan in progress',
        html: 'Scanning for any unsaved Homestead.yaml files...<br><br>This may take a minute',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          Swal.showLoading()
        }
    })
    const find = spawn('find', ['/Users', '-name', 'Homestead.yaml'])

    let rawData = []
    
    find.stdout.on('data', (data) => {
        rawData = rawData.concat(data.toString().split(/\r?\n/))
    })

    find.on('exit', function (code, signal) {
        const pattern = /.*\/vendor.*\/resources\/Homestead.yaml/gm
        let homesteadBoxes = settings.get('homestead_boxes')
        // Remove known default yaml files, then remove blanks, then remove items already in our homestead_boxes
        const result = rawData.filter(val => !pattern.test(val)).filter(Boolean)
        for( var i=result.length - 1; i>=0; i--){
            for( var j=0; j<homesteadBoxes.length; j++){
                if(result[i] && (result[i] === homesteadBoxes[j].path + '/Homestead.yaml' )){
                   result.splice(i, 1)
                }
            }
        }
        if (Array.isArray(result) && result.length > 0) { 
            boxScanSwal(result, cb)
        } else {
            Swal.fire({
                title: 'No unsaved Homestead.yaml files found',
                icon: 'success',
            })
        }
    })
}

const boxScanSwal = (resultsArr, cb) => {
    Swal.fire({
        title: 'Homestead.yaml found at the following path',
        html: `<p>${resultsArr[0]}</p><p>What would you like to name this box?</p>`,
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Don\'t Save',
        allowOutsideClick: false,
        preConfirm: (input) => {
            let homesteadBoxes = settings.get('homestead_boxes')
            let newBox = {
                name: input,
                path: resultsArr[0].replace('/Homestead.yaml', ''),
            }
            getIdFromPath(newBox.path, id => {
                newBox.id = id
                homesteadBoxes.push(newBox)
                settings.set('homestead_boxes', homesteadBoxes)
            })
        },
      }).then(res => {
        resultsArr.shift()
        if (resultsArr.length > 0) {
            boxScanSwal(resultsArr, cb)
        } else {
            cb(settings.get('homestead_boxes'))
        }
      })
}