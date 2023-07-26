import * as linkify from "linkifyjs";
import axios, { AxiosInstance } from "axios";

interface AccessToken {
  access_token: string;
  expires_in: number;
}

export class Spotify {
  private readonly accessTokenRefreshWindowMilliseconds = 2 * 60 * 1000;

  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;

  private requestClient: AxiosInstance;
  private accessToken?: string;
  private accessTokenExpiryTimestamp?: number;

  constructor(clientId: string, clientSecret: string, refreshToken: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;

    this.requestClient = axios.create({
      baseURL: "https://api.spotify.com/v1/",
    });

    this.requestClient.interceptors.request.use(async (request) => {
      request.headers.Authorization = "Bearer " + (await this.getAccessToken());

      return request;
    });
  }

  async appendToPlaylist(
    playlistId: string,
    trackUris: string[],
    deduplicate: boolean = true
  ) {
    const uris = trackUris.slice(0, 99);
    const url = `playlists/${playlistId}/tracks`;

    if (deduplicate) {
      await this.requestClient.request({
        url,
        method: "DELETE",
        data: {
          tracks: uris.map((uri) => ({
            uri,
          })),
        },
      });
    }

    return (await this.requestClient.post(url, { uris })).data;
  }

  private get accessTokenNeedsRefresh(): boolean {
    return (
      this.accessToken === undefined ||
      this.accessTokenExpiryTimestamp === undefined ||
      this.accessTokenExpiryTimestamp - Date.now() <=
        this.accessTokenRefreshWindowMilliseconds
    );
  }

  private async getAccessToken() {
    if (!this.accessTokenNeedsRefresh) {
      return this.accessToken;
    }

    const params = new URLSearchParams();
    params.append("client_id", this.clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", this.refreshToken);

    const response = await axios.post<AccessToken>(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
              "base64"
            ),
        },
      }
    );

    this.accessTokenExpiryTimestamp =
      Date.now() + response.data.expires_in * 1000;
    this.accessToken = response.data.access_token;

    return this.accessToken;
  }

  static getSpotifyTrackUris(content: string): string[] {
    return [
      ...new Set(
        linkify
          .find(content)
          .map((link) => new URL(link.href))
          .filter(
            (url) =>
              url.hostname === "open.spotify.com" &&
              url.pathname.match(/\/track\/(.+)/) !== null
          )
          .map((url) => `spotify:track:${url.pathname.split("/").slice(-1)[0]}`)
      ),
    ];
  }
}
