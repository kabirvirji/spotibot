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

          if (message.body.indexOf('play ') > -1 && message.body.indexOf('@spotify') > -1 && message.body.length !== 13) {

            let songname = message.body.slice(14);
            let songToSearch = message.body.toLowerCase();
            songToSearch = message.body.slice(14);
            const searchResults = await spotifyApi.searchTracks(songToSearch);
            if (searchResults.body.tracks.items[0] != null) {
              const searchArtist = searchResults.body.tracks.items[0].artists[0].name;
              spotify.playTrack(searchResults.body.tracks.items[0].uri, function(){
                  if(err) return console.error(err);
              });

            } else {
              api.sendMessage(`❌ Oops, that search didn't work! Please try again`, message.threadID);
              console.log(chalk.red(`Oops, that search didn't work! Please try again`));
            }


            setTimeout(function () { spotify.getTrack(function(err, track){
                const name = track.name;
                const artist = track.artist;
                api.sendMessage(`spotibot currently playing ${name} by ${artist} 🎵`, message.threadID);
                console.log(chalk.green(`spotibot currently playing ${name} by ${artist}`));
                });
          }, 1000);

          }

          if (message.body.indexOf('queue') > -1 && message.body.indexOf('@spotify') > -1){

            const songToSearchforQueue = message.body.slice(15); // takes just the song name eg. "queue songname" will just take songname
            const searchResultsforQueue = await spotifyApi.searchTracks(songToSearchforQueue); // search results like before
            if (searchResultsforQueue.body.tracks.items[0] != null) {
                const songToQueue = searchResultsforQueue.body.tracks.items[0].uri;
                const searchQueueArtist = searchResultsforQueue.body.tracks.items[0].artists[0].name;
                queue_array.push(songToQueue);
                api.sendMessage(`Adding ${songToSearchforQueue} by ${searchQueueArtist} up next 🎵`, message.threadID);
                console.log(chalk.green(`spotibot just queued ${songToSearchforQueue} by ${searchQueueArtist}`));
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

          if (message.body.indexOf('@spotify playlist') > -1) {

            // get users playlists using username and bearer token
            const spotifyUsername = config.get('SpotifyUsername');
            const spotifyBearer = config.get('bearer');
            // if they didn't provide either ask them again -> send fb message to check terminal
            // if they are invalid ask them again -> send fb message to check terminal

            // with user playlists search for whatever comes after @spotify play playlist <playlistname>
            const playlistToSearch = message.body.slice(18);
            console.log(playlistToSearch);

          var options = {
            json: true, 
            headers: {
              'Authorization' : `Bearer ${config.get('bearer')}`,
              'Accept' : 'application/json'
            }
          };
          console.log(config.get('SpotifyUsername'));
          console.log(`https://api.spotify.com/v1/users/${config.get('SpotifyUsername')}/playlists?limit=50`);
          got(`https://api.spotify.com/v1/users/${config.get('SpotifyUsername')}/playlists?limit=50`, options)
            .then(response => {

              //console.log(response.body.items[0].name);
              var size = response.body.items.length;
              console.log(`response size ${size}`)
              const playlistNames = response.body.items;
              let playlistURI;
              for (var i = 0;i<size;i++){
                //console.log(playlistNames[i]);
                if (playlistNames[i].name == playlistToSearch){
                  console.log('found playlist');
                  const foundPlaylist = playlistNames[i].name;
                  console.log(foundPlaylist);
                  playlistURI = playlistNames[i].id;
                  console.log(playlistURI);

                  break;

                } else {
                  console.log('not it');
                }
              }
              console.log(`https://api.spotify.com/v1/users/${config.get('SpotifyUsername')}/${playlistURI}/tracks`);
              // this request not working
              got(`https://api.spotify.com/v1/users/${config.get('SpotifyUsername')}/playlists/${playlistURI}/tracks`, options)
                .then(response => {

                  const playlistTracksArray = response.body.items;
                  for (var i = 0; i < playlistTracksArray.length; i++){
                    queue_array.push(playlistTracksArray[i].track.uri);
                  }
                  console.log(queue_array);

                })

            })

          }



        }

    });


    var checkStatus = setInterval( async function() {

      spotify.getState(function(err, state){

        if (Math.ceil(state.position) === 0 && state.state === 'paused'){
          if (queue_array.length >= 1){
              spotify.playTrack(queue_array[0], function(){
                  if(err) return console.error(err);
              });
              queue_array.shift();
              setTimeout(function () {
              spotify.getTrack(function(err, track){
                const name = track.name;
                const artist = track.artist;
                console.log(chalk.green(`spotibot currently playing ${name} by ${artist}`));
                });
            }, 2000);
          }
        }
      });
    }, 
    1000);

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


