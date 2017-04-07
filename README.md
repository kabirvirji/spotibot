# spotibot
A Spotify Messenger bot <br>
For Mac OS <br>
Need the Spotify desktop app installed and be logged in there
# troubleshooting
Might need to start playing music manually first <br>
Open Spotify Desktop app (Try/Catch, on catch say to download it or open it)<br>
Playlists limit to 50 <br>
Bearer tokens expire after an hour: https://developer.spotify.com/web-api/console/get-playlists/
# native spotify settings to test
Turn on autoplay to keep the music going <br>
Fade in and out
# TODO
- [ ] Need to await login before checking what song is playing ie if song is playing before user runs script
- [ ] Error checks for http fails, expired bearer token (doesnt work suggest new token or invalid username)
- [ ] Need to await the interval function to ensure desktop app is open, if it isn't then throw and error
- [ ] Does it traverse playlist folders? What if the name given is the playlist folder name? Desired playlist in folder? 50 limit?

