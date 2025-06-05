const { ytmp3, ttdl, igdl, ytmp4, transcript, pindl, mfdl, fbPhoto, ttdl2, fbVideo } = require("./api/downloader.js")
const { tiktoks, pinterest, search, GoogleImage, lyrics } = require("./api/search.js")
const { githubStalk, tiktokStalk, ytStalk, genshinStalk, igStalk } = require("./api/stalking.js")
const downloader = require('./api/downloader.js');
const searchApi = require('./api/search.js');
const stalk = require('./api/stalking.js');

async function list() {
  const allFunctions = {
    ...downloader,
    ...searchApi,
    ...stalk,
  };

  const commandNames = Object.keys(allFunctions);
  let text = '📄 *Daftar Fitur Tersedia:*\n\n';

  commandNames.forEach((cmd, i) => {
    const formatted = cmd.charAt(0).toUpperCase() + cmd.slice(1);
    text += `${i + 1}. ${formatted}\n`;
  });

  return text;
}

module.exports = {
  search,
  ytmp3,
  ytmp4,
  transcript,
  pindl,
  tiktoks,
  pinterest,
  githubStalk,
  tiktokStalk,
  ytStalk,
  GoogleImage,
  ttdl,
  igdl,
  genshinStalk,
  mfdl,
  igStalk,
  fbPhoto,
  ttdl2,
  fbVideo,
  lyrics,
  list
}

