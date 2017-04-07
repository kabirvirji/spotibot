# spotibot
A Spotify Messenger bot <br>
For Mac OS <br>
https://developer.spotify.com/web-api/console/get-playlists/
Need the Spotify desktop app installed and be logged in there
# troubleshooting
Open Spotify Desktop app (Try/Catch, on catch say to download it or open it)<br>
Playlists limit to 50 <br>
Bearer tokens expire after an hour: https://developer.spotify.com/web-api/console/get-playlists/
# native spotify settings to test
Turn on autoplay to keep the music going. This will override anything in the queue <br>
Fade in and out
# TODO
- [x] Need to await login before checking what song is playing ie if song is playing before user runs script
- [x] Error checks for http fails, expired bearer token (doesnt work suggest new token or invalid username)
- [ ] Need to await the interval function to ensure desktop app is open, if it isn't then throw and error
- [ ] Does it traverse playlist folders? What if the name given is the playlist folder name? Desired playlist in folder? 50 limit?
- [ ] Need to use for npm my version of facebook chat api

