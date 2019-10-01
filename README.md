<img src="/icons/larva.png" width="100px" alt="Larval Logo">

## What the heck's a Larval?

Larval is a Graphical User Interface (GUI) for managing sites, settings, and status within Laravel Homestead. With it you can view, create, and delete sites in your Homestead environment. As well as change Homestead settings, bring vagrant up/down, ssh into vagrant, and provision.

Larval is in it's Alpha stages and though extensively tested it is not fully recommended for production use. Though the app does have options to back them up before changes it is recommended you manually make a backup of your hosts and Homestead.yaml file. Larval and it's contributors will not be held liable for any lost data.

The app is currently only available for MacOS, the DMG and App file may be generated via npm command
```
npm run package-mac
```

Or the DMG can be download [here](https://larval.s3-us-west-1.amazonaws.com/Larval.dmg)

Please feel free to notate any issues or recommendations within a respective Github issue.

#### `Laravel Homestead is required to use this application and upon startup you need will be asked to select the path to your Homestead folder`

### Why is my password asked for when editing a site?
You are required to enter your password in order to enact the changes to your hosts file. The password prompt is OS level, no information of your user or password is passed into or stored within Larval.

### Why does Larval ask for access to my microphone when you click start in the vagrant window?
This is caused by the booting up of the virtual machine and of yet I have been unable to figure out how to disable that feature. (If anyone knows how please let me know) You can deny access to the microphone with no detriment to Larvals functions and if enabled no data is recorded, used, or accessed from your microphone by Larval.

#### Have any recommendations for these docs? Let me know!
