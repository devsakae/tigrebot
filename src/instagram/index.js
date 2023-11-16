const { MessageMedia } = require('whatsapp-web.js');
const { fetchWithParams } = require('../../utils');
const { client } = require('../connections');

const instagram = async (m) => {
  const grupo = m.from;
  const user = m.body.split(' ')[1].trim();
  getMediaFrom(user).then(async (res) => {
    const media = await MessageMedia.fromUrl(res.url);
    client.sendMessage(grupo, media, { caption: res.caption })
  })
}

const getMediaFrom = async (user) => {
  console.log('getMediaFrom...');
  return fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL,
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user
    }
  }).then((response) => {
    const mediaFile = response[0].node.__typename === 'GraphVideo' ? response[0].node.video_url : response[0].node.display_url;
    return { url: mediaFile, caption: response[0].node.edge_media_to_caption.edges[0].node.text }
  })
}

module.exports = {
  instagram,
  getMediaFrom,
}