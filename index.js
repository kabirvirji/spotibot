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
const myconfig = require('./config.json');


// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();

function auth() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
        // {
        //   type: 'input',
        //   message: 'Enter your Facebook username',
        //   name: 'username'
        // },
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

  init();
  var totalTime = 0;
  var queue_array = [];
  
// this function should only be executed when the user sends a message to PLAY a song ???


/*
To stop those logging messages

api.setOptions({
    logLevel: "silent"
});
*/

// need to wait to be logged in before interval function starts
// {email: config.get('username'), password: config.get('password')}
login({email: myconfig.username, password: myconfig.password}, async (err, api) => {
    if(err) return console.error(err);

    api.setOptions({
        selfListen: true,
        logLevel: "silent"
    });

    api.listen( async (err, message) => {
        if(err) return console.error(err);

        let spotifyApi = new SpotifyWebApi();

        if (message.body !== undefined){

          if (message.body.indexOf('play') > -1 && message.body.indexOf('@spotify') > -1 && message.body.length !== 13) {

            let songname = message.body.slice(14);
            let songToSearch = message.body.toLowerCase();
            songToSearch = message.body.slice(14);
            const searchResults = await spotifyApi.searchTracks(songToSearch);
            if (searchResults.body.tracks.items[0] != null) {
              const searchArtist = searchResults.body.tracks.items[0].artists[0].name;
              totalTime = searchResults.body.tracks.items[0].duration_ms;
              console.log(`total time: ${totalTime}`)
              spotify.playTrack(searchResults.body.tracks.items[0].uri, function(){
                  if(err) return console.error(err);
              });
              api.sendMessage(`Playing ${songname} by ${searchArtist} 🎵`, message.threadID);
              console.log(chalk.green(`spotibot is currently playing ${songname}`));

            } else {
              api.sendMessage(`❌ Oops, that search didn't work! Please try again`, message.threadID);
              console.log(chalk.red(`Oops, that search didn't work! Please try again`));
            }

          }

          if (message.body.indexOf('queue') > -1 && message.body.indexOf('@spotify') > -1){

            const songToSearchforQueue = message.body.slice(14); // takes just the song name eg. "queue songname" will just take songname
            const searchResultsforQueue = await spotifyApi.searchTracks(songToSearchforQueue); // search results like before
            if (searchResultsforQueue.body.tracks.items[0] != null) {
                const songToQueue = searchResultsforQueue.body.tracks.items[0].uri;
                const searchQueueArtist = searchResultsforQueue.body.tracks.items[0].artists[0].name;
                queue_array.push(songToQueue);
                console.log(queue_array);
                api.sendMessage(`Adding ${songToQueue} by ${searchQueueArtist} up next 🎵`, message.threadID);
                console.log(chalk.green(`spotibot just queued ${songToQueue} by ${searchQueueArtist}`));
            } else {
              api.sendMessage(`❌ Oops, that search didn't work! Please try again`, message.threadID);
              console.log(chalk.red(`Oops, that search didn't work! Please try again`));
            }

          } 

          if (message.body == '@spotify next'){
            spotify.next(function() {
              console.log('Playing the next song!');
              api.sendMessage(`⏩ playing the next song`, message.threadID);
            });
          }

          if (message.body == '@spotify back'){
            spotify.previous(function() {
              console.log('Playing the previous song!');
              api.sendMessage(`⏪ playing previous song`, message.threadID);
            });
          }

          if (message.body == '@spotify pause'){
            spotify.getState(function(err, state){
                if (state.state == 'playing'){
                  spotify.pause(function() {
                    console.log('Pausing the current song');
                    api.sendMessage(`⏸ pausing your music!`, message.threadID);
                  });
                } else {
                    console.log('The song is already paused!');
                    api.sendMessage(`The song is already paused!`, message.threadID);
                }
            });
          }

          if (message.body == '@spotify play'){
            spotify.getState(function(err, state){
                if (state.state !== 'playing'){
                  spotify.play(function() {
                    console.log('Playing the current song');
                    api.sendMessage(`▶️ playing your music!`, message.threadID);
                  });
                } else {
                    console.log('The song is already playing!');
                    api.sendMessage(`The song is already playing!`, message.threadID);
                }
            });
          }

        }

    });


    var checkStatus = setInterval( async function() {

      // get time and consistantly check if curr-1 == actual
      // need two get spotify here

      // check position every second and play next song in queue

      spotify.getState(function(err, state){
        /*
        state = {
            volume: 99,
            position: 232,
            state: 'playing'
        }
        */
        // console.log(`Total time: ${totalTime}`);
        // console.log(typeof state.position);
        // console.log(state.position * 1000);
        // console.log(totalTime/1000);
        if (Math.ceil(state.position) === 0 && state.state === 'paused'){
          console.log("song done");
          console.log(queue_array);
          if (queue_array.length >= 1){
              spotify.playTrack(queue_array[0], function(){
                  if(err) return console.error(err);
              });
              queue_array.shift();
              console.log(queue_array);
          }

        }

        // when search for song need to the length of it
      });


    }, 
    1000);

});

          spotify.getTrack(function(err, track){
            const name = track.name;
            const artist = track.artist;
            console.log(`spotibot currently playing ${name} by ${artist}`);
            });




}

async function loginToFacebook() {
  return new Promise((resolve, reject) => {
    login({ email: myconfig.username, password: myconfig.password }, (err, api) => {
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
config.get('username') === undefined || config.get('password') === undefined
if (config.get('password') === undefined) {
	let authorization = await auth();
}
spotibot(cli.input[0], cli.flags);


})()


