#!/usr/bin/env node
'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const login = require('facebook-chat-api');
const fs = require('fs');
const meow = require('meow');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Conf = require('conf');


// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();

function auth() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
        {
          type: 'input',
          message: 'Enter your Facebook username',
          name: 'username'
        },
        {
          type: 'password',
          message: 'Enter your Facebook password',
          name: 'password'
        }
    ]).then(function (answers) {
      var answer = JSON.stringify(answers);
      config.set(answers);
      resolve(true);
    }).catch(err => reject(err));
  });
}

const spotibot = async function spotibot(inputs, flags) {

	var Queue = [];

	init();

	async function listenFacebook(err, message) {
		var { body } = message;
		// remove any caps
		var body = body.toLowerCase();

		// api calls
		console.log('waiting for fb');


	}


var checkStatus = setInterval(function() {

	// get time and consistantly check if curr-1 == actual
	// need two get spotify here
	console.log('interval function');
}, 
1000);

async function loginToFacebook() {
  return new Promise((resolve, reject) => {
    login({ email: config.get('username'), password: config.get('password') }, (err, api) => {
      if (err) reject(err);
      resolve(api);
    })
  });
}

async function init() {
  api = await loginToFacebook();
  api.listen(listenFacebook);
}

/*
To stop those logging messages

api.setOptions({
    logLevel: "silent"
});
*/



// login({email: configJSON.username, password: configJSON.password}, function callback (err, api) {
//     if(err) return console.error(err);
//	   Hardcoded this message id so maybe that's why I got all the messages
//     var yourID = 1626794548;
//     var msg = {body: "Hey! My name is Spotify Bot and I'm here to help you control your music! To play a song tell me to \"play <songname>\". To queue a song (add it to up next) tell me to \"queue <songname>\". Have fun 🎵"};
//     api.sendMessage(msg, yourID);
// });


}

const cli = meow(chalk.cyan(`
    Usage
      $ spotibot --config [-c] /path/to/config.json

    Example
      $ singlespotify -c /Users/kabirvirji/config.json

    For more information visit https://github.com/kabirvirji/spotibot

`), {
    alias: {
        c: 'config'
    }
}, [""]
);

(async () => {

if (config.get('username') === undefined || config.get('bearer') === undefined) {
	let authorization = await auth();
}
spotibot(cli.input[0], cli.flags);

})()


