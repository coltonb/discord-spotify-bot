import * as linkify from "linkifyjs";
import axios, { AxiosInstance } from "axios";
import type Config from "./config";
import https from "https";

interface AccessToken {
  access_token: string;
  expires_in: number;
}

class Track {
  trackId: string;

  constructor(trackId: string) {
    this.trackId = trackId;
  }

  toString(): string {
    return `spotify:track:${this.trackId}`;
  }
}

export class Spotify {
  private readonly accessTokenRefreshWindowMilliseconds = 2 * 60 * 1000;

  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;

  private requestClient: AxiosInstance;
  private accessToken?: string;
  private accessTokenExpiryTimestamp?: number;

  constructor(config: typeof Config.spotify.client) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.refreshToken = config.refreshToken;

    this.requestClient = axios.create({
      baseURL: "https://api.spotify.com/v1/",
    });

    this.requestClient.interceptors.request.use(async (request) => {
      request.headers.Authorization = "Bearer " + (await this.getAccessToken());

      return request;
    });
  }

  async appendToPlaylist(playlistId: string, tracks: Track[]) {
    const url = `playlists/${playlistId}/tracks`;

    return (await this.requestClient.post(url, { uris: tracks.map(String) }))
      .data;
  }

  async deleteFromPlaylist(playlistId: string, tracks: Track[]) {
    const url = `playlists/${playlistId}/tracks`;

    return (
      await this.requestClient.delete(url, {
        data: {
          tracks: tracks.map((track) => ({
            uri: String(track),
          })),
        },
      })
    ).data;
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

  static async getSpotifyTrackUris(content: string): Promise<Track[]> {
    return [
      ...new Set(
        (await this.getSpotifyLinks(content)).map(
          (url) => url.pathname.split("/").slice(-1)[0]
        )
      ),
    ].map((uri) => new Track(uri));
  }

  private static getUrls(content: string): URL[] {
    return linkify.find(content).map((link) => new URL(link.href));
  }

  private static async getSpotifyLinks(content: string) {
    let urls = this.getUrls(content);
    urls = await this.resolveSpotifyLinks(urls);

    return urls.filter(
      (url) =>
        url.hostname === "open.spotify.com" &&
        url.pathname.match(/\/track\/(.+)/) !== null
    );
  }

  private static async resolveSpotifyLinkRedirect(
    url: URL
  ): Promise<URL | undefined> {
    let pageContent: string;

    try {
      pageContent = (await axios.get(String(url))).data;
    } catch {
      return undefined;
    }

    return this.getUrls(pageContent).filter(
      (url) => url.hostname === "open.spotify.com"
    )[0];
  }

  private static async resolveSpotifyLinks(urls: URL[]): Promise<URL[]> {
    const resolvedUrls = await Promise.all(
      urls.map(async (url) => {
        if (url.hostname === "spotify.link") {
          return await this.resolveSpotifyLinkRedirect(url);
        }
        return url;
      })
    );

    return resolvedUrls.filter((url): url is URL => url !== undefined);
  }
}
