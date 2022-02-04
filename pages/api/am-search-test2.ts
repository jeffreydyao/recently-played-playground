import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppleMusicLinks } from '../../lib/applemusic';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
  const response = await getAppleMusicLinks();
  const { items } = await response.json();
  
  
  // TODO: Type maps
  // TODO: Refactor this code similar to now-playing?
  const recently_played = items.map((track: any) => ({
      url: track.track[0].attributes.url
  }))

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=30' // Work out how many seconds you want to keep response fresh
  );

  return res.status(200).json({ recently_played });
};  
