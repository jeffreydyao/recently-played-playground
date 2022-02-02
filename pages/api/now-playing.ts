import type { NextApiRequest, NextApiResponse } from 'next';
import { getNowPlaying } from '../../lib/spotify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await getNowPlaying();

  if (response.status === 204 || response.status > 400) {
    return res.status(200).json({ isPlaying: false });
  }

  const track = await response.json();

  if (track.item === null) {
    return res.status(200).json({ isPlaying: false });
  }

  // TODO: Type _artist
  
  const album = track.item.album.name;
  const artist = track.item.artists.map((_artist: any) => _artist.name).join(', ');
  const artwork_url = track.item.album.images[0].url;
  const isPlaying = track.is_playing;
  const preview_url = track.item.preview_url;
  const spotify_url = track.item.uri;
  const title = track.item.name;

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=30'
  );

  return res.status(200).json({
    album,
    artist,
    artwork_url,
    isPlaying,
    preview_url,
    spotify_url,
    title
  });
}
