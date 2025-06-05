#<h1 align="center">🎬 SIMPEL SCRAPER 1.0.0</h1>

<p align="center">
  
  Scraper downloader easily via simple API by kelvdra.<br>
  <strong>Auto-updated on error fixes</strong> — join our channel for latest info!
</p>

---

## 📢 Stay Connected

📡 **Kelvdra System Channel**  
Join to get the latest updates, changelogs, and more.

- 🔗 [Join Channel](https://whatsapp.com/channel/0029VadrgqYKbYMHyMERXt0e)  
- 📞 [Contact Admin](https://wa.me/6285173328399)

---

 ![ ](https://files.catbox.moe/gxgtrz.jpg)

## ⚙️ Installation

Install using npm:

```bash
npm install @kelvdra/scraper
```

## Usage

```Javascript
const { list } = require('@kelvdra/scraper');
```

## Quality Available

```Javascript
const audio = [128];
const video = [360, 720];
```
## Download Youtube Audio (MP3) 🎧

```Javascript
const url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID';
const quality = "128";

ytmp3(url, quality)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.result);
    }
  });

// or use default quality (128)
// quality only 128
// ytmp3(url)
```

## Download Youtube Video (MP4) 📹

```Javascript
const url = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID';
const quality = "360";

ytmp4(url, quality)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.result);
    }
  });

// or use default quality (360)
// quality only 360 & 720
// ytmp4(url)
```

## Search Youtube 🔍
```Javascript
const query = 'your search term';

search(query)
    .then(result => {
        if (result.status) {
            console.log('Search Results:', result.results);
        } else {
            console.error('Error:', result.result);
        }
    });
```
## Tiktok Downloader
```Javascript
const url = 'https://www.tiktok.com/@username/video/1234567890';

ttdl(url)
  .then(result => {
    if (result.status) {
      console.log('Video:', result.data.video);
      console.log('Audio:', result.data.audio);
      console.log('Cover:', result.data.cover);
    } else {
      console.error('Error:', result.message);
    }
  });
```
## Playmp3 & Playmp4
```Javascript
const query = 'Lagu galau';

playmp3(query)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.message);
    }
  });

playmp4(query)
  .then(result => {
    if (result.status) {
      console.log('Download Link:', result.download);
      console.log('Metadata:', result.metadata);
    } else {
      console.error('Error:', result.message);
    }
  });
```

## Pinterest Download
```Javascript
const link = 'https://pin.it/63p8EvKYl';

pindl(link)
  .then(result => {
    if (result.status) {
      if (result.isVideo) {
        console.log('Video URL:', result.video);
      } else {
        console.log('Image URL:', result.image);
      }
      console.log('Info:', result.info);
    } else {
      console.error('Error:', result.mess);
    }
  });
```

[Documentation](https://skyzoo92.github.io/Scraper/)

## 🧑‍💻 Author

**Kelvdra**
License: [MIT](./LICENSE)

<p align="center"><i>Powered by Kelvdra System • Fast • Simple • Efficient</i></p>


