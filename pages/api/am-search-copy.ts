import type { NextApiRequest, NextApiResponse } from "next";
import { getRecentlyPlayed } from "../../lib/spotify";
import tokenGenerator from "../../lib/musickit-token";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const devToken = await tokenGenerator(); // Get Apple Music developer token
  const response = await getRecentlyPlayed(); // Get recently played items from Spotify with metadata
  const { items } = await response.json(); // Parse as json so we can traverse the tree
  var results: any[] = []; // Return results of Apple Music search into array

  const SEARCH_CATALOG_ENDPOINT = `https://api.music.apple.com/v1/catalog/AU/songs`;

  // Filter data to return ISRCs of recently played tracks only
  const spotifyTracks = items
    .map((track: any) => ({
      isrc: track.track.external_ids.isrc,
    }))
    .map(function (track: any) {
      return track.isrc;
    });

  console.log(spotifyTracks)

  // Iterate over array of ISRCs sequentially to fetch first result from Apple Music for each

  return new Promise((resolve, reject) => {
    spotifyTracks.map((track) => {
      fetch(
        `https://api.music.apple.com/v1/catalog/US/songs?filter[isrc]=${track}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${devToken}`,
          },
        }
      );
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(JSON.parse(results).data));
    resolve();
  });
}
