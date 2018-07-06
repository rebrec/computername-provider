# Computer Name Provider

## Description



### Rename-Computer.ps1 (The Client )

It's a Powershell script (Powershell v2 minimum) that must be run as Local Administrator
It will communicate with the ComputerName-Provider Webserver to obtain the name of the 
computer based on its hostname.


### The Server

It's the Node.js webservice that the powershell script will communicate with.

It has 2 roles :

- It has an API endpoint that the powershell script will use to obtain its hostname 
information based on its serial number.
- It hosts a Web application that administrators will use to :
  - List already known hostname / serial associations
  - Modify specific hostname for a specific serial number
  - Change the next computer name for not known serials

## Usage

## Prerequisites

You will need :

- A Server (Linux is probably the easier choice) hosting the **Web Serverice**
- A computer on which you will run the client to rename it (during a deployment process probably) using 
`powershell.exe -file Rename-Computer.ps1`

## Installation

*Note : to install this software, you will have to download the source using `git`
If you are a Windows user and don't know how to simply get and use git, i recommend
you to get [Babun](http://babun.github.io/). This software will provide you with a
sort of Linux Console on your Windows computer with a lot of useful tools like `git`*

### Server

**TLDR** : Run this code as user `root`

```
apt-get install curl
adduser computername-provider
su - computername-provider
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
$SHELL
nvm install v6.9.4
npm install pm2 -g
git clone https://github.com/rebrec/computername-provider.git
cd computername-provider
npm i
pm2 start app
pm2 Save
############################################################################################
# Please Read carefully the output of the next command :
# pm2 will now ask you to run some command as root.
# so simply copy / paste it to your terminal
############################################################################################
pm2 startup
exit 2>1 1>/dev/null
exit 2>1 1>/dev/null
```

**Explaination :**

Install curl

```
apt-get install curl
```

Create a user `computername-provider` with

```
adduser computername-provider
```

Switch to this new user using

```
su - computername-provider
```

Install [nvm](https://github.com/creationix/nvm) :

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Run your current shell again to be able to use nvm

```
$SHELL
```

Install needed version of [Node.js]([https://nodejs.org/)

```
nvm install v6.9.4
```

Install [pm2](http://pm2.keymetrics.io/) :

```
npm install pm2 -g
```

Clone this repository :

```
git clone https://github.com/rebrec/computername-provider.git
```

Enter the repository folder

```
cd computername-provider
```

Installed needed packages

```
npm i
```

Run the server

```
pm2 start app
```

Save current process list managed by pm2 to run at server startup

```
pm2 Save
```

Generate startup script for your distribution (auto detection)
```
pm2 startup
```

**The previous command will display a command that you have to run as *root*.**

Exit the previous new shell and exit su command (to go back as root so you can paste your command)

```
exit 2>1 1>/dev/null
exit 2>1 1>/dev/null
```

Now you should be `root` again, to type the command suggested by `pm2 startup`


If everything went well, you should be able to access The Webserver using your browser at
`http://YOUR_SERVER_IP:8088/` and whenever you restart your server, this webserver will 
be run again thanks to *pm2*.


### Rename-Computer.ps1 (The Client)

#### Setup the API Host Information
- Edit this powershell file and modify the below variables as needed : 
```
$API_PROTOCOL 	= 'http'
$API_HOST 		= '192.168.103.18'  # You will put your server ip address here
$API_PORT 		= 8088
$API_ENDPOINT	= 'api'
```

## Issues

## Contribute

## Donate
