import type { NextApiRequest, NextApiResponse } from 'next';
import { getRecentlyPlayed } from '../../lib/spotify';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
  const response = await getRecentlyPlayed();
  const { items } = await response.json();
  
  
  // TODO: Type maps
  // TODO: Refactor this code similar to now-playing?
  const recently_played = items.map((track: any) => ({
      artist: track.track.artists.map((data: any) => data.name).join(', '),
      artwork_url: track.track.album.images[2].url,
      isrc: track.track.external_ids.isrc,
      played_at: track.played_at,
      preview_url: track.track.preview_url,
      spotify_url: track.track.uri,
      title: track.track.name,
  }))

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=30' // Work out how many seconds you want to keep response fresh
  );

  return res.status(200).json({ recently_played });
};  
