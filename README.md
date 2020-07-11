# Sign Up & Login APIs using Express Framework Node.JS (MongoDB)
Rest API for signup and login in expressjs framework of node.js 12.x version. MongoDB is used as connection database.

## Install MondoDB and Secure the DB
If you know how to do this and already have done, go ahead and start installing Node.js in your local machines. Otherwise here's [how to securely install mongodb.](https://pedalsup.com/install-secure-mongodb-on-google-cloud-platform/)
Here's how to secure your [database](https://pedalsup.com/secure-database-with-user-roles-in-mongodb/)

## Install Node.JS
follow these commands to install node 12.x on your ubuntu based system. 
```
sudo apt update
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt -y  install gcc g++ make
```
Check installed version  
```
node -v
npm -v
```

## Clone this Repository
clone this repository by git clone command or download zip and extract in your local machine 
```
git clone https://github.com/jimishio/nodejs-expressjs-signup-login-api
```

## Install dependencies
Run below command to install dependecies required.
```
cd nodejs-expressjs-signup-login-api
npm install
```

## Run application locally
Run below command to install dependecies required.
```
node api-server.js
```

## Run application on Server using forever
Run below command to install forever globally
```
npm install forever -g
```

Run application with forever
```
forever start /path/to/api-server.js
```

Check Status of Running application
```
forever list
```
