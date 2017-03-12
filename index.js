#!/usr/bin/env node
'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const login = require('facebook-chat-api');
const fs = require('fs');
const meow = require('meow');
const chalk = require('chalk');

const spotibot = async function singlespotify(inputs, flags) {

	const configFile = flags['c'];
	var Queue = [];
	console.log(configFile);

	// get information from path to config file
	try {
		var configJSON = JSON.parse(require('fs').readFileSync(configFile, 'utf8'));
	}
	catch(err) {
		console.log(chalk.red(`
	Oops! That wasn't a valid config path. Try again please!

	See https://github.com/kabirvirji/spotibot for more information
	`))
		return
	}

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

async function init() {
  await initSpotify();
  api = await loginToFacebook();
  api.listen(listenFacebook);
}

function loginToFacebook() {
  return new Promise((resolve, reject) => {
    login({ email: configJSON.username, password: configJSON.password }, (err, api) => {
      if (err) reject(err);
      resolve(api);
    })
  });
}


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

spotibot(cli.input[0], cli.flags);