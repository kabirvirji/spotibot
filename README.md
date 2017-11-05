# HEADS UP
THIS IS CURRENTLY A WORK IN PROGRESS SINCE SPOTIFY UPDATED THEIR API
# spotibot 🤖
A Spotify Messenger bot <br> can make the bot an image to make larger
For Mac OS <br> requirments
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
- [x] Need to await the interval function to ensure desktop app is open, if it isn't then throw and error
- [ ] Does it traverse playlist folders? What if the name given is the playlist folder name? Desired playlist in folder? 50 limit?
- [ ] Need to use for npm my version of facebook chat api and pull in recent changes
- [ ] Add config so ppl don't keep queueing closer by chain smokers thanks @jaypatel for the idea
- [ ] If bearer tokens are expired (even if provided correctly earlier) then playlist search fails and script exists
- [ ] Rewrite using API callbacks so it works on any device
- [ ] Priority Queue

If auth gets annoying could have terminal browser pop up to authenticate user

