#!/usr/bin/env node
'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const login = require('facebook-chat-api');
const fs = require('fs');
const meow = require('meow');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Conf = require('conf');
var spotify = require('spotify-node-applescript');


// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();

function auth() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
        {
          type: 'input',
          message: 'Enter the bot\'s Facebook username',
          name: 'username'
        },
        {
          type: 'password',
          message: 'Enter the bot\'s Facebook password',
          name: 'password'
        },
        {
          type: 'input',
          message: 'Enter YOUR Facebook ID (https://github.com/kabirvirji/spotibot for more information)',
          name: 'id'
        }
    ]).then(function (answers) {
      var answer = JSON.stringify(answers);
      config.set(answers);
      resolve(true);
    }).catch(err => reject(err));
  });
}

const spotibot = async function spotibot(inputs, flags) {

  init();

	var Queue = [];
  
// this function should only be executed when the user sends a message to PLAY a song ???

    var checkStatus = setInterval( async function() {

    	// get time and consistantly check if curr-1 == actual
    	// need two get spotify here

      // check position every second and play next song in queue

    	console.log(chalk.cyan('interval function'));


    }, 
    1000);
/*
To stop those logging messages

api.setOptions({
    logLevel: "silent"
});
*/

// need to wait to be logged in before interval function starts

login({email: config.get('username'), password: config.get('password')}, async (err, api) => {
    if(err) return console.error(err);

    api.setOptions({
        selfListen: true,
        logLevel: "silent"
    });

    api.listen( async (err, message) => {
        if(err) return console.error(err);

        let spotifyApi = new SpotifyWebApi();

        if (message.body !== undefined){




          if (message.body.indexOf('play') > -1 && message.body.indexOf('@spotify') > -1) {

            let songname = message.body.slice(14);
            let songToSearch = message.body.toLowerCase();
            songToSearch = message.body.slice(14);
            const searchResults = await spotifyApi.searchTracks(songToSearch);
            if (searchResults.body.tracks.items[0] != null) {
              spotify.playTrack(searchResults.body.tracks.items[0].uri, function(){
                  if(err) return console.error(err);
              });

            }

            api.sendMessage(`Playing ${songname}`, message.threadID);
            console.log(chalk.green(`Playing ${songname}`));

          }



        }

    });
});

}

async function loginToFacebook() {
  return new Promise((resolve, reject) => {
    login({ email: config.get('username'), password: config.get('password') }, (err, api) => {
      if (err) {
        reject(err);
        resolve(api);
        console.log('wrong username or password');
    }
    })
  });
}

async function init() {
  api = await loginToFacebook();
  api.listen(listenFacebook);
}



const cli = meow(chalk.cyan(`
    Usage
      $ spotibot

    Example
      $ singlespotify
      Enter your bot's Facebook username: mybot@gmail.com
      Enter your bot's Facebook password: **********
      Enter YOUR user id: 1301312

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


