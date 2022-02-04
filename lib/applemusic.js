import tokenGenerator from "./musickit-token";
import { getRecentlyPlayed } from "./spotify";

export const getAppleMusicLinks = async () => {
  const devToken = await tokenGenerator(); // Get Apple Music developer token
  const response = await getRecentlyPlayed(); // Get recently played items from Spotify with metadata
  const { items } = await response.json(); // Parse as json so we can traverse the tree


  const SEARCH_CATALOG_ENDPOINT = `https://api.music.apple.com/v1/catalog/AU/songs`;

  // Filter data to return ISRCs of recently played tracks only
  const spotifyTracks = items
    .map((track) => ({
      isrc: track.track.external_ids.isrc,
    }))
    .map(function (track) {
      return track.isrc;
    });

  // Iterate over array of ISRCs sequentially to fetch first result from Apple Music for each

  // Define promise function to call in Promise.all
  const results = spotifyTracks.map((track) => {
    fetch(
      `https://api.music.apple.com/v1/catalog/US/songs?filter[isrc]=${track}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${devToken}`,
        },
      }
    )
  });
};
