import tokenGenerator from "./musickit-token";

export const getAppleMusicLinks = async () => {
  const devToken = await tokenGenerator();

  const response = await getRecentlyPlayed();
  const { items } = await response.json();

  // How to make this function shorter?
  const recently_played = items
    .map((track) => ({
      isrc: track.track.external_ids.isrc,
    }))
    .map(function(track){
      return track.isrc;
    }).join(",");


  const ISRC_SEARCH_ENDPOINT = `https://api.music.apple.com/v1/catalog/US/songs?filter[isrc]=${recently_played}`;

  return fetch(ISRC_SEARCH_ENDPOINT, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${devToken}`
    },
  });
};

