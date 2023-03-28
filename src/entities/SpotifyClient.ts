import "dotenv/config";
import SpotifyWebApi from "spotify-web-api-node";

export class SpotifyClient {
  private api: SpotifyWebApi;

  constructor() {
    this.api = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_SECRET,
    });
  }

  /**
   * Returns the track title and artist as "<title> artist" from
   * given "open.spotify.com/track" url.
   * Returns Error elsewise.
   */
  public async getSpotifyTrackTitleAndArtist(
    url: string,
  ): Promise<string | Error> {
    const trackId = this.getSpotifyTrackURL(url);
    let titleAndArtist = "";

    await this.api
      .getTrack(trackId)
      .then(async (data) => {
        let title = data.body.name;
        let artist = data.body.artists[0].name;
        titleAndArtist = `${title} ${artist}`;
      })
      .catch((err) => {
        console.log(err);
        const error = new Error();
        error.message = "Error fetching Spotify track!";
        return error;
      });

    return titleAndArtist;
  }

  /**
   * Requests access token using client credentials flow with
   * client id and secret set in constructor and then sets the
   * access token on this instance of the api client. This needs to be
   * called after every instantiation.
   */
  public async grantSpotifyAPIAccess(): Promise<void> {
    await this.api.clientCredentialsGrant().then((data) => {
      this.api.setAccessToken(data.body["access_token"]);
    });
  }

  /**
   * Returns the track id from an "open.spotify.com/track" url
   * TODO: Use a better regex
   */
  private getSpotifyTrackURL(url: string): string {
    return url.replace(/.*(track\/)/, "").replace(/\?.*$/, "");
  }
}
