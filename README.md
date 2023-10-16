# discord-spotify-bot

A discord bot that silently scrapes a server for Spotify track links and dumps them into a configured playlist.

# Configuration

| Environment Variable  | Value                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| SPOTIFY_CLIENT_ID     | The unique identifier of your Spotify app.                                                                                                  |
| SPOTIFY_CLIENT_SECRET | The key used to authenticate your Spotify app.                                                                                              |
| SPOTIFY_REFRESH_TOKEN | The refresh token for your Spotify app used to retrieve Bearer tokens for authorization. Can be retrieved using `npm run get-refresh-token` |
| SPOTIFY_PLAYLIST_ID   | The ID of the playlist to manage.                                                                                                           |
| DISCORD_TOKEN         | The authorization token for the Discord client.                                                                                             |

## Obtaining a Refresh Token

A refresh token can be obtained using the `get-refresh-token.ts` script.

This script opens a web server on `localhost:8888` which redirects to Spotify to obtain authorization for the app to interact with your personal Spotify playlists. Once authorization is obtained, the refresh token is output in both the console and in the browser.
