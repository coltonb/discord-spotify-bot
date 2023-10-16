import express from "express";
import config from "../src/config";
import axios from "axios";

const scopes = ["playlist-modify-public", "playlist-modify-public"];
const redirect_uri = "http://localhost:8888/callback";

const app = express();
let server: any = null;

app.get("/", function (req, res) {
  const params = new URLSearchParams();
  params.set("response_type", "code");
  params.set("client_id", config.spotify.client.clientId);
  params.set("scope", scopes.join(" "));
  params.set("redirect_uri", redirect_uri);

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get("/callback", async function (req, res) {
  const data = new URLSearchParams();
  data.set("grant_type", "authorization_code");
  data.set("client_id", config.spotify.client.clientId);
  data.set("client_secret", config.spotify.client.clientSecret);
  data.set("redirect_uri", redirect_uri);
  data.set("code", (req.query as any).code);

  const response = await axios.post(
    `https://accounts.spotify.com/api/token`,
    data
  );

  console.log("Refresh Token:", response.data.refresh_token);
  res.end(`Refresh Token: ${response.data.refresh_token}`);

  server.close();
});

console.log(
  "Generate your refresh token by visiting http://localhost:8888 and authorizing your Spotify app."
);
server = app.listen(8888);
