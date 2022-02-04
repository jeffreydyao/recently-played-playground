import { access } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { getRecentlyPlayed } from "../../lib/spotify";
import getAccessToken from "../../lib/youtube-token";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const apiKey = process.env.YOUTUBE_API_KEY; // Use YouTube API key from .env.local
  const response = await getRecentlyPlayed(); // Get recently played items from Spotify with metadata
  const { items } = await response.json(); // Parse as json so we can traverse the tree
  const accessToken = await getAccessToken(); // Retrieve new YouTube access token

  // Filter data to return ISRCs of recently played tracks only
  // Maybe I can just import this from somewhere else? Otherwise you're going to be running it three times;
  // memory cost
  const spotifyTracks = items
    .map((track: any) => ({
      artist: track.track.artists.map((data: any) => data.name).join(', '),
      title: track.track.name,
    }))
    .map(function (track: any) {
      return track.title + " - " + track.artist + " (Official Video)"; // String query for YouTUbe
    });

  console.log(accessToken)

  // Iterate over array of queries sequentially to fetch first result from YouTUbe for each
  
  function fetchAll(data) {
    return Promise.all(
      data.map((track) =>
        fetch(
          `https://api.music.apple.com/v1/catalog/US/songs?filter[isrc]=${track}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${devToken}`,
            },
          }
        )
          .then((r) => r.json())
          .then((data) => {
            return JSON.stringify(data.data[0].attributes.url);
          })
          .catch((error) => ({ error }))
      )
    );
  }

  const results = await fetchAll(spotifyTracks);

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=30" // Work out how many seconds you want to keep response fresh
  );

  return res.status(200).json({ results });

  /* const responses = await Promise.all(results)

  const promises = await Promise.all(responses.map((response) => response.json()))

  return promises */
}
