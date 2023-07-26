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

  if (tracks.length === 0) return;

  spotify.appendToPlaylist(process.env.SPOTIFY_PLAYLIST_ID!, tracks);
});

client.login(process.env.DISCORD_TOKEN!);
