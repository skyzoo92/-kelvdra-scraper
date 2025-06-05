const axios = require('axios')
const gis = require('g-i-s')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const yts = require('yt-search')

const tiktoks = async (query) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://tikwm.com/api/feed/search',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=en',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      },
      data: new URLSearchParams({
        keywords: query,
        count: 10,
        cursor: 0,
        HD: 1,
      }).toString(),
    });

    const videos = response.data?.data?.videos;
    if (!videos || videos.length === 0) {
      return {
        status: false,
        message: 'Video tidak ditemukan.'
      };
    }

    return {
      status: true,
      creator: '@kelvdra/scraper',
      results: videos
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || 'Terjadi kesalahan saat memproses permintaan.'
    };
  }
}

const pinterest = async (query) => {
  return new Promise((resolve, reject) => {
    gis({ searchTerm: query + ' site:id.pinterest.com' }, (err, res) => {
      if (err) {
        return resolve({
          status: false,
          message: "Terjadi kesalahan dalam mengambil gambar"
        });
      }

      let hasil = res.map(x => x.url);

      if (hasil.length === 0) {
        return resolve({
          status: false,
          message: "Tidak ditemukan hasil untuk pencarian tersebut."
        });
      }

      resolve({
        status: true,
        creator: '@kelvdra/scraper',
        results: hasil
      });
    });
  });
}

const GoogleImage = async (query) => {
  try {
    const response = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      },
    });

    const data = await response.text();
    const $ = cheerio.load(data);

    const pattern = /\[1,\[0,"(?<id>[\d\w\-_]+)",\["https?:\/\/(?:[^"]+)",\d+,\d+\]\s?,\["(?<url>https?:\/\/(?:[^"]+))",\d+,\d+\]/gm;
    const matches = [...$.html().matchAll(pattern)];

    const decodeUrl = (url) => decodeURIComponent(JSON.parse(`"${url}"`));
    const images = matches
      .map(({ groups }) => decodeUrl(groups?.url))
      .filter((v) => /.*\.(jpe?g|png|webp)$/i.test(v));

    if (!images.length) {
      return {
        status: false,
        message: 'Gambar tidak ditemukan.'
      };
    }

    return {
      status: true,
      creator: '@kelvdra/scraper',
      results: images
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || 'Terjadi kesalahan saat mengambil gambar.'
    };
  }
}

const search = async (query) => {
  try {
    const result = await yts(query);
    return {
      status: true,
      creator: '@kelvdra/scraper',
      results: result.all
    };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

const lyrics = async (text) => {
  try {
    const searchText = encodeURIComponent(text);
    const { data } = await axios.get("https://songsear.ch/q/" + searchText);
    const $ = cheerio.load(data);

    const result = {
      title: $("div.results > div:nth-child(1) > .head > h3 > b").text() +
        " - " +
        $("div.results > div:nth-child(1) > .head > h2 > a").text(),
      album: $("div.results > div:nth-child(1) > .head > p").text(),
      number: $("div.results > div:nth-child(1) > .head > a")
        .attr("href")
        .split("/")[4],
      thumb: $("div.results > div:nth-child(1) > .head > a > img").attr("src"),
    };

    if (!result.title.trim()) {
      throw new Error("Lagu tidak ditemukan.");
    }

    const { data: lyricData } = await axios.get(
      `https://songsear.ch/api/song/${result.number}?text_only=true`
    );

    if (!lyricData.song || !lyricData.song.text_html) {
      throw new Error("Lirik tidak ditemukan.");
    }

    let lyrics = lyricData.song.text_html
      .replace(/<br\/>/g, "\n")
      .replace(/&#x27;/g, "'")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\n+/g, "\n")
      .replace(/^\n|\n$/g, "")
      .replace(/\s+/g, " ");

    return {
      status: true,
      title: result.title,
      album: result.album,
      thumb: result.thumb,
      lyrics: lyrics,
    };
  } catch (err) {
    return {
      status: false,
      error: err.message || "Terjadi kesalahan.",
    };
  }
}


module.exports = {
  tiktoks,
  pinterest,
  GoogleImage,
  search,
  lyrics
}
