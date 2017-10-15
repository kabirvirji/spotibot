#!/usr/bin/env node
'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const login = require('facebook-chat-api');
const meow = require('meow');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Conf = require('conf');
const spotify = require('spotify-node-applescript');
const got = require('got');
const myInformation = require('./config.json')
const Heap = require('mnemonist/heap');

// NEED TO TO ASK FOR FB AND SPOTIFY PASSWORD

// let MaxHeap = require('mnemonist/heap').MaxHeap;

// create new max heap 
// let heap = new Heap();

// config file stored in /Users/{home}/Library/Preferences/{project-name}
const config = new Conf();

function auth() {
  return new Promise((resolve, reject) => {
    inquirer.prompt([
        {
          type: 'input',
          message: 'Facebook username',
          name: 'username'
        },
        {
          type: 'password',
          message: 'Facebook password',
          name: 'password'
        },
        {
          type: 'input',
          message: 'Spotify username',
          name: 'SpotifyUsername'
        },
        {
          type: 'password',
          message: 'Spotify Bearer token',
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

  var queue_array = [];

  login({email: myInformation.facebookUsername, password: myInformation.facebookPassword}, async (err, api) => {
      if(err) {
        console.log(chalk.red("Wrong username or password"));
        process.exit();
      }
      // Ability to message yourself
      api.setOptions({
          selfListen: true,
          logLevel: "silent"
      });

      api.listen( async (err, message) => {
          if(err) {
            console.log(chalk.red("Wrong username or password"));
            process.exit();
          }

        let spotifyApi = new SpotifyWebApi();

        if (message.body !== undefined){

          // @spotibot play <songname>
          if (message.body.indexOf('play ') > -1 && message.body.indexOf('@spotibot') > -1 && message.body.length !== 13) {
            let songname = message.body.slice(14);
            let songToSearch = message.body.toLowerCase();
            songToSearch = message.body.slice(15);
            // replace spaces in songToSearch with "+"
            const NewsongToSearch = songToSearch.split(' ').join('+');
            console.log(NewsongToSearch)

            // need to use got for this & official spotify API since spotify API changed
            // const searchResults = await spotifyApi.searchTracks(songToSearch);
            // https://api.spotify.com/v1/search

            const options = {
              json: true, 
              headers: {
                'Authorization' : `Bearer ${config.get('bearer')}`,
                'Accept' : 'application/json'
              }
            };

            got(`https://api.spotify.com/v1/search?q=${NewsongToSearch}&type=track`, options)
              .then(response => {
                console.log(response.body.tracks.items[0]);
                // can get the URI from the above response
                // need to identify the device and then play it on the device
              })
              .catch(error => {
                console.log(error.response.body);
                //=> 'Internal server error ...'
              });


            if (searchResults.body.tracks.items[0] != null) {
              const searchArtist = searchResults.body.tracks.items[0].artists[0].name;
              spotify.playTrack(searchResults.body.tracks.items[0].uri, function(){
                  if(err) return console.error(err);
              });
            // Getting a track now requires an API key, so need to do this a different way
            // Can use GOT with the provided token to search for a track
            setTimeout(function () { spotify.getTrack(function(err, track){
                const name = track.name;
                const artist = track.artist;
                api.sendMessage(`spotibot currently playing ${name} by ${artist} 🎵`, message.threadID);
                console.log(chalk.green(`spotibot currently playing ${name} by ${artist}`));
                });
          }, 1000);

            } else {
              api.sendMessage(`❌ Oops, that search didn't work! Please try again`, message.threadID);
              console.log(chalk.red(`Oops, that search didn't work! Please try again`));
            }

          }

          // @spotibot queue <songname>
          if (message.body.indexOf('queue') > -1 && message.body.indexOf('@spotibot') > -1){

            const songToSearchforQueue = message.body.slice(15); // takes just the song name eg. "queue songname" will just take songname
            const searchResultsforQueue = await spotifyApi.searchTracks(songToSearchforQueue); // search results like before
            if (searchResultsforQueue.body.tracks.items[0] != null) {

                const songToQueue = searchResultsforQueue.body.tracks.items[0].uri;
                const searchQueueArtist = searchResultsforQueue.body.tracks.items[0].artists[0].name;
                queue_array.push(songToQueue);
                // need to do some max heap manipulation here
                api.sendMessage(`Adding${songToSearchforQueue} by ${searchQueueArtist} up next 🎵`, message.threadID);
                console.log(chalk.green(`spotibot just queued ${songToSearchforQueue} by ${searchQueueArtist}`));
            } else {
              api.sendMessage(`❌ Oops, that search didn't work! Please try again`, message.threadID);
              console.log(chalk.red(`Oops, that search didn't work! Please try again`));
            }

          } 

          if (message.body == '@spotibot next'){
            spotify.next(function() {
              console.log(chalk.cyan('Playing the next song!'));
              api.sendMessage(`⏩ playing the next song`, message.threadID);
              // pop off the heap
            });
          }

          if (message.body == '@spotibot back'){
            spotify.previous(function() {
              console.log(chalk.cyan('Playing the previous song!'));
              api.sendMessage(`⏪ playing previous song`, message.threadID);
              // heap needs to keep memory
            });
          }

          if (message.body == '@spotibot pause'){
            spotify.getState(function(err, state){
                if (state.state == 'playing'){
                  spotify.pause(function() {
                    console.log(chalk.cyan('Pausing the current song'));
                    api.sendMessage(`⏸ pausing your music!`, message.threadID);
                  });
                } else {
                    console.log(chalk.cyan('The song is already paused!'));
                    api.sendMessage(`The song is already paused!`, message.threadID);
                }
            });
          }

          if (message.body == '@spotibot play'){
            spotify.getState(function(err, state){
                if (state.state !== 'playing'){
                  spotify.play(function() {
                    console.log(chalk.cyan('Playing the current song'));
                    api.sendMessage(`▶️ playing your music!`, message.threadID);
                  });
                } else {
                    console.log(chalk.cyan('The song is already playing!'));
                    api.sendMessage(`The song is already playing!`, message.threadID);
                }
            });
          }

          // @spotibot playlist <playlist you follow name> 
          if (message.body.indexOf('@spotibot playlist') > -1) {

            const spotifyUsername = config.get('SpotifyUsername');
            const spotifyBearer = config.get('bearer');
            const playlistToSearch = message.body.slice(19);
            var options = {
              json: true, 
              headers: {
                'Authorization' : `Bearer ${config.get('bearer')}`,
                'Accept' : 'application/json'
              }
            };
            got(`https://api.spotify.com/v1/users/${config.get('SpotifyUsername')}/playlists?limit=50`, options)
              .then(response => {
                const size = response.body.items.length;
                const playlistNames = response.body.items;
                let playlistURI;
                let playlistOwner;
                for (var i = 0;i<size;i++){
                  if (playlistNames[i].name == playlistToSearch){
                    const foundPlaylist = playlistNames[i].name;
                    playlistURI = playlistNames[i].id;
                    playlistOwner = playlistNames[i].owner.id;
                    break;
                  }
                }
                got(`https://api.spotify.com/v1/users/${playlistOwner}/playlists/${playlistURI}/tracks`, options)
                  .then(response => {
                    const playlistTracksArray = response.body.items;
                    for (var i = 0; i < playlistTracksArray.length; i++){
                      queue_array.push(playlistTracksArray[i].track.uri);
                    }
                    api.sendMessage(`The playlist "${playlistToSearch}" is ready to go! 🚀`, message.threadID);

                  })
                  .catch(error => {
                    console.log("Sorry, that playlist wasn't found! Check your spelling, or move your playlist up on your account. The Spotify API has a 50 playlist limit.")
                    api.sendMessage(`❌ Oops, that playlist wasn't found!`, message.threadID);
                  })
              })
              .catch(error => {
                console.log("Wrong Spotify Username or Password. Please make sure you provide them for playlist access")
                api.sendMessage(`❌ Something went wrong, please check terminal!`, message.threadID);
                config.clear();
                setTimeout(function () {
                  process.exit();
                }, 2000);
              });
            }
          }
      });

    const checkStatus = setInterval( async function() {

      spotify.getState(function(err, state){
        // if spotify isn't open already on mac this breaks
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

const cli = meow(chalk.cyan(`
    Usage
      $ spotibot

    Example
      $ spotibot
      Facebook username: kabirvirji@gmail.com
      Facebook password: **********
      Spotify username: kabirvirji
      Spotify bearer: ***********************************

    For more information visit https://github.com/kabirvirji/spotibot

`), {
    alias: {
        c: 'config'
    }
}, [""]
);

(async () => {
if (config.get('username') === undefined || config.get('password') === undefined || config.get('SpotifyUsername') === undefined || config.get('bearer') === undefined) {
	let authorization = await auth();
}
spotibot(cli.input[0], cli.flags);

})()
