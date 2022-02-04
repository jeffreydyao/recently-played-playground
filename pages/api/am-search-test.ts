import type { NextApiRequest, NextApiResponse } from "next";
import { getRecentlyPlayed } from "../../lib/spotify";
import tokenGenerator from "../../lib/musickit-token";
import { resolve } from "path/posix";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const devToken = await tokenGenerator(); // Get Apple Music developer token
  const response = await getRecentlyPlayed(); // Get recently played items from Spotify with metadata
  const { items } = await response.json(); // Parse as json so we can traverse the tree

  const SEARCH_CATALOG_ENDPOINT = `https://api.music.apple.com/v1/catalog/AU/songs`;

  // Filter data to return ISRCs of recently played tracks only
  const spotifyTracks = items
    .map((track: any) => ({
      isrc: track.track.external_ids.isrc,
    }))
    .map(function (track: any) {
      return track.isrc;
    });

  // Iterate over array of ISRCs sequentially to fetch first result from Apple Music for each

  // Define promise function to call in Promise.all


  // Takes an array of ISRCs (unique song IDs), searches them on Apple Music and returns their Apple Music URLs.
  // Modified from https://stackoverflow.com/questions/50006595/using-promise-all-to-fetch-a-list-of-urls-with-await-statements
  // Study this code further to understand more about how it works!
  function fetchAll(data) {
    return Promise.all(
      data.map(track => fetch(
        `https://api.music.apple.com/v1/catalog/US/songs?filter[isrc]=${track}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${devToken}`,
          },
        })
        .then(r => r.json())
        .then(data => {return JSON.stringify(data.data[0].attributes.url)})
        .catch(error => ({ error }))
      )
    )
  }

  const results = await fetchAll(spotifyTracks)

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=30" // Work out how many seconds you want to keep response fresh
  );

  return res.status(200).json({ results });

  /* const responses = await Promise.all(results)

  const promises = await Promise.all(responses.map((response) => response.json()))

  return promises */
}
