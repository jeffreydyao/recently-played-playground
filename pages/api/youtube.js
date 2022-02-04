import { google } from 'googleapis';
import { getRecentlyPlayed } from "../../lib/spotify";

let googleAuth;

export default async (_, res) => {
/*   const response = await getRecentlyPlayed(); // Get recently played items from Spotify with metadata
  const { items } = await response.json(); // Parse as json so we can traverse the tree */

  googleAuth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY
    },
    scopes: ['https://www.googleapis.com/auth/youtube.readonly']
  });

  const youtube = google.youtube({
    auth: googleAuth,
    version: 'v3'
  });

  const response = await youtube.search.list({
    part: 'snippet',
    maxResults: 1,
    q: "Dusty Locane",
  });

  const search = response.data.items[0];
  const videoId = search.id.videoId;
  const url = `https://www.youtube.com/watch?v=${videoId}`


  return res.status(200).json({
    url
  });
};


/* 
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
} */
