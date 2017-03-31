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
const got = require('got');
const myconfig = require('./config.json');

// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();

function auth() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
        // {
        //   type: 'input',
        //   message: 'Facebook username',
        //   name: 'username'
        // },
        // {
        //   type: 'password',
        //   message: 'Facebook password',
        //   name: 'password'
        // },
        {
          type: 'input',
          message: 'Spotify username (optional)',
          name: 'SpotifyUsername'
        },
        {
          type: 'password',
          message: 'Spotify Bearer token (optional)',
          name: 'bearer'
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

          if (message.body.indexOf('@spotify play playlist') > -1) {

            // get users playlists using username and bearer token
            const spotifyUsername = config.get('SpotifyUsername');
            const spotifyBearer = config.get('bearer');
            // if they didn't provide either ask them again -> send fb message to check terminal
            // if they are invalid ask them again -> send fb message to check terminal

            // with user playlists search for whatever comes after @spotify play playlist <playlistname>
            const playlistToSearch = message.body.slice(22);
            console.log(playlistToSearch);

            /*
            curl -X GET 
            "https://api.spotify.com/v1/users/kabirvirji/playlists" 
            -H "Accept: application/json" 
            -H "Authorization: Bearer BQB1uyjiIsPds55VybLq_1FlbZ_1xRr28fmqBGAwqm"
            */

            // whatever.playlistname
            // get all playlist tracks with tracks api call given in the search
            // queue all those tracks

          }

          var options = {
            json: true, 
            headers: {
              'Authorization' : `Bearer ${config.get('bearer')}`,
              'Accept' : 'application/json'
            }
          };

          got(`https://api.spotify.com/v1/users/${config.get('SpotifyUsername')}/playlists`, options)
            .then(response => {

              console.log(response.body);

            })
            .catch(error => {
              console.log(error.response.body);
            });

        }

    });


    var checkStatus = setInterval( async function() {

      spotify.getState(function(err, state){

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
      Facebook username: kabirvirji@gmail.com
      Facebook password: **********
      Spotify username (optional): kabirvirji
      Spotify bearer (optional): ***********************************

    For more information visit https://github.com/kabirvirji/spotibot

`), {
    alias: {
        c: 'config'
    }
}, [""]
);

(async () => {
// config.get('username') === undefined || config.get('password') === undefined
if (config.get('bearer') === undefined || config.get('SpotifyUsername') === undefined) {
	let authorization = await auth();
}
spotibot(cli.input[0], cli.flags);

})()


