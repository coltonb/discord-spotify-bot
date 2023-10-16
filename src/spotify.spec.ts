import { Spotify } from "./spotify";

describe("getSpotifyTrackUris", () => {
  it("resolves spotify.link URLs", async () => {
    expect(
      (
        await Spotify.getSpotifyTrackUris(
          "https://spotify.link/1yONyk9wVDb is a track, https://spotify.link/iqFLMEqkVDb is an episode"
        )
      ).map(String)
    ).toEqual(["spotify:track:3wdtYmf9G6WhG3OUiJuLC0"]);
  });

  it.each([
    "Check out this cool song https://open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV?si=b907241c938c4fa6 and episode https://open.spotify.com/episode/6zBOy5jF1T7vNh7w9iBEjb?si=e7443473e6a74035 my friends.",
    "Take a look https://open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV?si=b907241c938c4fa6&somethingelse=10",
    "https://open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV is awesome, I love https://open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV",
    "open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV",
  ])("returns a single song ID from %p", async (messageContent: string) => {
    expect(
      (await Spotify.getSpotifyTrackUris(messageContent)).map(String)
    ).toEqual(["spotify:track:1lrXtifnIpyXmtPR1S0QKV"]);
  });

  it.each([
    "https://open.spotify.com/track/7JLxcjfAKYKJqfN7XyiL8f?si=34d83a0372174858 and https://open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV?si=b907241c938c4fa6!",
    "https://open.spotify.com/track/7JLxcjfAKYKJqfN7XyiL8f, open.spotify.com/track/1lrXtifnIpyXmtPR1S0QKV are awesome",
  ])("returns multiple song IDs from %p", async (messageContent: string) => {
    expect(
      (await Spotify.getSpotifyTrackUris(messageContent)).map(String)
    ).toEqual([
      "spotify:track:7JLxcjfAKYKJqfN7XyiL8f",
      "spotify:track:1lrXtifnIpyXmtPR1S0QKV",
    ]);
  });

  it.each([
    "https://other.spotify.com/track/7JLxcjfAKYKJqfN7XyiL8f?si=34d83a0372174858",
    "open.spoodafooda.com/track/7JLxcjfAKYKJqfN7XyiL8f",
  ])("returns no song IDs from %p", async (messageContent: string) => {
    expect(
      (await Spotify.getSpotifyTrackUris(messageContent)).map(String)
    ).toEqual([]);
  });
});
