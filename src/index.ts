import { Client, Events, GatewayIntentBits } from "discord.js";
import { Spotify } from "./spotify";
import config from "./config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const spotify = new Spotify(config.spotify.client);
const { playlistId } = config.spotify;

client.on(Events.MessageCreate, async (message) => {
  const tracks = (await Spotify.getSpotifyTrackUris(message.content)).slice(
    0,
    99
  );
  const logPrefix = `[${message.id}]`;

  if (tracks.length === 0) return;

  console.log(logPrefix, `Appending tracks ${tracks} to playlist:`, playlistId);

  try {
    await spotify.deleteFromPlaylist(playlistId, tracks);
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

client.login(config.discord.token);
