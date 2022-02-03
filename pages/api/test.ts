import { NextApiRequest, NextApiResponse } from "next";
import { getRecentlyPlayed } from "../../lib/spotify";
import tokenGenerator from "../../lib/musickit-token";

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const {
    query: { offset = 0, limit = 6 },
  } = req;

  const response = await getRecentlyPlayed();
  const { items } = await response.json();
  const devToken = await tokenGenerator();


  const recently_played = items
    .map((track: any) => ({
      isrc: track.track.external_ids.isrc,
    }))
    .map(function(track: any){
      return track.isrc;
    }).join(",");

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    `Bearer ${ devToken }`
  );

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  return new Promise((resolve, reject) => {
    fetch(
      `https://api.music.apple.com/v1/catalog/US/songs?filter[isrc]=${recently_played}`, // `https://api.music.apple.com/v1/me/history/heavy-rotation?limit=6`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(JSON.parse(result).data));
        resolve();
      })
      .catch((error) => {
        res.json(error);
        res.status(404).end();
        return resolve();
      });
  });
};
