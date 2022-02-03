// Modified from https://gist.github.com/leemartin/0dac81a74a58f8587270dca9089ddb7f#file-musickit-token-encoder-js
// Generates an Apple MusicKit developer token.

const teamId = process.env.APPLE_DEVELOPER_TEAM_ID;
const keyId = process.env.APPLE_DEVELOPER_KEY_ID;

const fs = require("fs");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync("AuthKey.p8").toString();

export default function tokenGenerator() {
  const jwtToken = jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "180d", // Change to 10s - or however long the API call should take, should get a fresh token every time
    issuer: teamId,
    header: {
      alg: "ES256",
      kid: keyId,
    },
  });

  return jwtToken;
}
