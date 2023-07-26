import { Client, Events, GatewayIntentBits } from "discord.js";
import { Spotify } from "./spotify";
import "dotenv/config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const spotify = new Spotify(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
  process.env.SPOTIFY_REFRESH_TOKEN!
);

client.on(Events.MessageCreate, async (message) => {
  const tracks = Spotify.getSpotifyTrackUris(message.content);
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID!;
  const logPrefix = `[${message.id}]`;

  if (tracks.length === 0) return;

  console.log(logPrefix, `Appending tracks ${tracks} to playlist:`, playlistId);

  try {
    await spotify.appendToPlaylist(playlistId, tracks);
  } catch (error) {
    console.error(logPrefix, "Failed to append tracks to playlist:", error);
    return;
  }

  console.log(
    logPrefix,
    "Successfully appended tracks to playlist:",
    playlistId
  );
});

client.login(process.env.DISCORD_TOKEN!);
