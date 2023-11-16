const { MessageMedia } = require('whatsapp-web.js');
const { fetchWithParams } = require('../../utils');
const { client } = require('../connections');

const instagram = async (m) => {
  const grupo = m.from;
  const user = m.body.split(' ')[1].trim();
  const latestPost = await getMediaFrom(user);
  console.log('got latestPost', latestPost)
  const media = await MessageMedia.fromUrl(latestPost.url);
  console.log(media);
  client.sendMessage(grupo, media, { media: media, caption: latestPost.caption })
}

const getMediaFrom = async (user) => {
  fetchWithParams({
    url: process.env.INSTAGRAM130_API_URL,
    host: process.env.INSTAGRAM130_API_HOST,
    params: {
      username: user
    }
  }).then((response) => {
    const mediaFile = response[0].node.__typename === 'GraphVideo' ? response[0].node.dash_info.video_url : response[0].node.display_url;
    console.log('this should be 3236885738246841787:', response[0].node.id);
    console.log('caption text:', response[0].node.edge_media_to_caption.edges[0].node.text);
    console.log('media url:', response[0].node.display_url);
    console.log('media url:', mediaFile);
    return { url: mediaFile, caption: response[0].node.edge_media_to_caption.edges[0].node.text }
  })
}

module.exports = {
  instagram,
  getMediaFrom,
}