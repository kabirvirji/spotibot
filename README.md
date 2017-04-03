# spotibot
A Spotify Messenger bot <br>
For Mac OS <br>
Need the Spotify desktop app installed and be logged in there <br>
# troubleshooting
Might need to start playing music manually first
Open Spotify Desktop app
Playlists limit to 50
Bearer tokens expire after an hour: https://developer.spotify.com/web-api/console/get-playlists/
# native spotify settings to test
Turn on autoplay to keep the music going
Fade in and out
# TODO
- [ ] Need to await login before checking what song is playing ie if song is playing before user runs script
- [ ] Error checks for http fails, expired bearer token (doesnt work suggest new token or invalid username)
- [ ] Need to await the interval function to ensure desktop app is open, if it isn't then throw and error

