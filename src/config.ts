import "dotenv/config";

export default {
  spotify: {
    client: {
      /** The unique identifier of your Spotify app. */
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      /** The key used to authenticate your Spotify app. */
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      /** The refresh token for your Spotify app used to retrieve Bearer tokens for authorization. */
      refreshToken: process.env.SPOTIFY_REFRESH_TOKEN!,
    },
    /** The ID of the playlist to manage. */
    playlistId: process.env.SPOTIFY_PLAYLIST_ID!,
  },
  discord: {
    /** The authorization token for the Discord client. */
    token: process.env.DISCORD_TOKEN!,
  },
};
