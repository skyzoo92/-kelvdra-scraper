const axios = require('axios');
const yts = require('yt-search');
const { createDecipheriv } = require('crypto');
const cheerio = require('cheerio');
const formData = require('form-data');
const { lookup } = require('mime-types');
const qs = require('qs');

/**
 * @param {string} url - URL YouTube
 * @param {string} quality - Bisa resolusi (360, 720) atau bitrate (128, 192)
 */
async function ssvidDownloader(url, quality = '360') {
  try {
    if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
      throw new Error('URL tidak valid');
    }

    // Deteksi otomatis apakah audio atau video
    const isAudio = ['64', '96', '128', '160', '192', '256', '320'].includes(quality);
    const type = isAudio ? 'audio' : 'video';

    const searchRes = await axios.post(
      'https://ssvid.net/api/ajax/search',
      qs.stringify({ query: url, vt: 'home' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    const searchData = searchRes.data;
    if (!searchData || searchData.status !== 'ok') {
      throw new Error('Gagal mengambil data video');
    }

    const info = {
      title: searchData.title,
      thumbnail: `https://img.youtube.com/vi/${searchData.vid}/hqdefault.jpg`,
      author: searchData.a,
      duration: searchData.t,
    };

    const video = [];
    const audio = [];

    const videos = searchData.links?.mp4 || {};
    for (const q in videos) {
      const item = videos[q];
      video.push({
        quality: item.q.replace('p', ''),
        size: item.size,
        format: item.f,
        k: item.k,
      });
    }

    const audios = searchData.links?.mp3 || {};
    for (const q in audios) {
      const item = audios[q];
      audio.push({
        quality: item.q.replace('kbps', ''),
        size: item.size,
        format: item.f,
        k: item.k,
      });
    }

    const selectedList = isAudio ? audio : video;
    const selected = selectedList.find(x => x.quality === quality) || selectedList[0];
    if (!selected || !selected.k) throw new Error('Format yang diminta tidak tersedia');

    const convertRes = await axios.post(
      'https://ssvid.net/api/ajax/convert',
      qs.stringify({ vid: searchData.vid, k: selected.k }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://ssvid.net/',
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const response = convertRes.data;
    const downloadUrl = response?.dlink || response?.url;
    if (!downloadUrl) throw new Error('Gagal mengonversi media');

    return {
      status: true,
      type,
      quality: `${quality}${isAudio ? 'kbps' : 'p'}`,
      availableQuality: isAudio ? audio : video,
      url: downloadUrl,
      filename: `${info.title} (${quality}${isAudio ? 'kbps).mp3' : 'p).mp4'}`,
    };
  } catch (err) {
    return {
      status: false,
      message: err.message || 'Terjadi kesalahan',
    };
  }
}

const ytmp3 = async (link, quality = 128) => {

  try {
    const info = await yts(videoUrl);
    const result = await ssvidDownloader(link, quality);
    return {
      status: true,
      creator: '@kelvdra/scraper',
      metadata: info.all[0],
      download: result
    };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

const ytmp4 = async (link, quality = 360) => {
  if (!link.includes('youtube.com') && !link.includes('youtu.be')) {
    return { status: false, message: 'URL YouTube tidak valid' };
  }

  try {
    const info = await yts(link);
    const result = await ssvidDownloader(link, quality);
    
    return {
      status: true,
      creator: '@kelvdra/scraper',
      metadata: info.all[0],
      download: result
    };
  } catch (e) {
    return { status: false, message: e.message };
  }
};

const transcript = async (url) => {
  try {
    let res = await axios.get('https://yts.kooska.xyz/', {
      params: { url: url },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://kooska.xyz/'
      }
    }).then(i=>i.data)
    return {
      status: true,
      creator: "@kelvdra/scraper",
      video_id: res.video_id,
      summarize: res.ai_response,
      transcript: res.transcript
    }
  } catch(e) {
    return {
      status: false,
      msg: `Gagal mendapatkan respon, dengan pesan: ${e.message}`
    }
  }
}

const playmp3 = async (query, quality = 128) => {
  try {
    const searchResult = await search(query);
    if (!searchResult.status || !searchResult.results.length)
      return { status: false, message: 'Video tidak ditemukan' };

    const results = [];
    for (let video of searchResult.results.slice(0, 5)) {
      const downloadInfo = await ssvidDownloader(video.url, quality, 'audio');
      results.push({
        title: video.title,
        author: video.author.name,
        duration: video.timestamp,
        url: video.url,
        thumbnail: video.thumbnail,
        download: downloadInfo
      });
    }

    return {
      status: true,
      creator: '@kelvdra/scraper',
      type: 'audio',
      results
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
};

const playmp4 = async (query, quality = 360) => {
  try {
    const searchResult = await search(query);
    if (!searchResult.status || !searchResult.results.length)
      return { status: false, message: 'Video tidak ditemukan' };

    const results = [];
    for (let video of searchResult.results.slice(0, 5)) {
      const downloadInfo = await ssvidDownloader(video.url, quality, 'video');
      results.push({
        title: video.title,
        author: video.author.name,
        duration: video.timestamp,
        url: video.url,
        thumbnail: video.thumbnail,
        download: downloadInfo
      });
    }

    return {
      status: true,
      creator: '@kelvdra/scraper',
      type: 'video',
      results
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
};


const ttdl = async (url) => {
    let retries = 0;
    let maxRetries = 10;
    let retryDelay = 4000;

    while (retries < maxRetries) {
        try {
            const res = await axios(`https://tikwm.com/api/?url=${url}`);
            const data = res.data?.data;

            if (!data) throw new Error(res.data?.msg || 'Invalid API response');

            const isPhotoMode = Array.isArray(data.images);

            return {
                status: true,
                creator: "@kelvdra/scraper",
                type: isPhotoMode ? "photo" : "video",
                title: data.title,
                author: {
                    username: data.author?.unique_id,
                    nickname: data.author?.nickname,
                    avatar: data.author?.avatar
                },
                ...(isPhotoMode
                    ? {
                        images: data.images,
                        imageCount: data.images.length
                    }
                    : {
                        duration: data.duration,
                        video_no_watermark: data.play,
                        video_watermark: data.wmplay,
                        music_url: data.music,
                        music_title: data.music_info?.title,
                        music_play: data.music_info?.play,
                        size: data.size,
                        wm_size: data.wm_size,
                    })
            };

        } catch (error) {
            retries++;
            if (retries >= maxRetries) {
                return {
                    status: false,
                    message: `Failed after ${maxRetries} attempts: ${error.message}`
                };
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

const pindl = async (url) => {
    try {
        let a = await axios.get(url, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/17.0 Chrome/96.0.4664.104 Mobile Safari/537.36",
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });

        let $ = cheerio.load(a.data);
        let x = $('script[data-test-id="leaf-snippet"]').text();
        let y = $('script[data-test-id="video-snippet"]').text();

        let g = {
            status: true,
            creator: "@kelvdra/scraper",
            isVideo: !!y,
            info: JSON.parse(x),
            image: JSON.parse(x).image,
            video: y ? JSON.parse(y).contentUrl : ''
        };

        return g;
    } catch (e) {
        return {
            status: false,
            mess: "failed download"
        };
    }
};

const igdl = async (url) => {
    try {
        let result = {
            status: true,
            creator: "@kelvdra/scraper",
            media: []
        }
        const {
            data
        } = await axios(`https://www.y2mate.com/mates/analyzeV2/ajax`, {
            method: "post",
            data: {
                k_query: url,
                k_page: "Instagram",
                hl: "id",
                q_auto: 0
            },
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "user-agent": "PostmanRuntime/7.32.2"
            }
        })
        await data.links.video.map((video) => result.media.push(video.url))
        return result
    } catch (err) {
        const result = {
            status: false,
            message: `Media not found`
        }
        return result
    }
}

const mfdl = async (url) => {
  try {
    const res = await fetch(`https://rianofc-bypass.hf.space/scrape?url=${encodeURIComponent(url)}`);
    const html = await res.json();
    const $ = cheerio.load(html.html);

    const result = {
      filename: $('.dl-info').find('.intro .filename').text().trim(),
      type: $('.dl-btn-label').find('.filetype > span').text().trim(),
      size: $('.details li:contains("File size:") span').text().trim(),
      uploaded: $('.details li:contains("Uploaded:") span').text().trim(),
      ext: /\.(.*?)/.exec($('.dl-info').find('.filetype > span').eq(1).text())?.[1]?.trim() || 'bin',
      download: $('.input').attr('href')
    };
    result.mimetype = lookup(result.ext.toLowerCase()) || 'application/octet-stream';

    return {
      status: true,
      creator: '@kelvdra/scraper',
      result
    };
  } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
}

const fbPhoto = async (url) => {
   try {
    async function getNonce() {
      const { data: nonce } = await axios.get(
        'https://thefdownloader.com/facebook-photo-downloader/',
      )
      const _ = cheerio.load(nonce)
      const skripKontent = _('#hmd-facebook-downloader-js-extra').html()
      const match = /"nonce":"([a-zA-Z0-9]+)"/.exec(skripKontent)
      return match?.[1]
    }
    const nonce = await getNonce()
    const base = {
      url: {
        admin: 'https://thefdownloader.com/wp-admin/admin-ajax.php',
      },
    }
    let data = new FormData()
    data.append('action', 'facebook_photo_action')
    data.append('facebook', `facebook_photo_url=${url}`)
    data.append('nonce', nonce)

    let response = await axios.post(base.url.admin, data, {
      headers: {
        ...data.getHeaders(),
      },
    })

    let $ = cheerio.load(response.data)
    let imageUrl = $('.facebook__media img').attr('src')

    return {
      status: true,
      creator: "@kelvdra/scraper",
      imageUrl
    }
    } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
 }

const fbVideo = async (u) => {
  try {
    if (!/^https?:\/\/(www\.)?facebook\.com/.test(u)) {
      throw new Error('Invalid Facebook URL');
    }

    function generatePayload(y) {
      return { id: y, locale: 'id' };
    }

    const pylox = generatePayload(u);
    const { data } = await axios.post('https://getmyfb.com/process', pylox);
    const $ = cheerio.load(data);

    const downloadLinks = [];

    const items = $('.results-list-item');
    if (!items.length) {
      throw new Error('No download links found. The video might be private or unavailable.');
    }

    items.each((_, el) => {
      const quality = $(el).text().trim();
      const link = $(el).find('a').attr('href');
      const filename = $(el).find('a').attr('download');

      if (link) {
        downloadLinks.push({ quality, link, ...(filename && { filename }) });
      }
    });

    return {
    status: true,
    creator: "@kelvdra/scraper",
    downloadLinks
   }
  } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
};

const ttdl2 = async (url) => {
  try {
    const response = await axios.post(
      'https://ssstik.io/abc?url=dl',
      new URLSearchParams({
        id: url,
        locale: 'id',
        tt: 'QmZkaXFj'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36',
          'Referer': 'https://ssstik.io/id',
          'HX-Request': 'true',
          'HX-Trigger': '_gcaptcha_pt',
          'HX-Target': 'target',
          'HX-Current-URL': 'https://ssstik.io/id'
        }
      }
    )

    const $ = cheerio.load(response.data)

    const isSlide = $('a.download_link.slide').length > 0

    const result = {
      status: true,
      type: isSlide ? 'slide' : 'video',
      video: null,
      videoHD: null,
      audio: null,
      slides: [],
      slideAsVideo: null
    }

    result.audio = $('a.download_link.music').attr('href') || null

    if (isSlide) {
      $('a.download_link.slide').each((i, el) => {
        const image = $(el).prev('img').attr('data-splide-lazy') || null
        const download = $(el).attr('href') || null
        if (image && download) {
          result.slides.push({ image, download })
        }
      })

      result.slideAsVideo = $('a.slides_video').attr('href') || null
    } else {
      result.video = $('a.download_link.without_watermark').attr('href') || null
      result.videoHD = $('a.download_link.without_watermark_hd').attr('onclick') || null
    }

    return {
    status: true,
    creator: "@kelvdra/scraper",
    result
    }

  } catch (err) {
    return { status: false, message: err.message }
  }
}

module.exports = {
  ttdl,
  playmp3,
  playmp4,
  ytmp3,
  ytmp4,
  transcript,
  pindl,
  igdl,
  mfdl,
  fbPhoto,
  ttdl2,
  fbVideo
};

