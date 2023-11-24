const { client } = require('../src/connections');
const config = require('../data/tigrebot.json');
const { MessageMedia } = require('whatsapp-web.js');

const sendTextToGroups = (text) => {
  Object.keys(config.grupos).forEach(async (grupo) => {
    const chat = await client.getChatById(grupo);
    chat.sendStateTyping();
    setTimeout(() => client.sendMessage(grupo, text), 1500)
  });
}

const sendTextToChannels = (text) => Object.keys(config.canais).forEach(async (channel) => await client.sendMessage(channel, text));

const sendMediaUrlToGroups = (media) => {
  Object.keys(config.grupos).forEach(async (grupo) => {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    client.sendMessage(grupo, mediaFile, { caption: media.caption })
  });
}

const sendMediaUrlToChannels = (media) => {
  Object.keys(config.canais).forEach(async (channel) => {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    await client.sendMessage(channel, mediaFile, { caption: media.caption });
  });
}

const sendInstagramToGroups = (media) => {
  Object.keys(config.grupos).forEach(async (grupo) => {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link + '\nCapturado e enviado até você por TigreBot (tigrebot.devsakae.tech)';
    await client.sendMessage(grupo, mediaFile, { caption: newCaption });
  })
}

const sendInstagramToChannels = (media) => {
  Object.keys(config.canais).forEach(async (channel) => {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link;
    await client.sendMessage(channel, mediaFile, { caption: newCaption });
  })
}

module.exports = {
  sendTextToGroups,
  sendTextToChannels,
  sendMediaUrlToGroups,
  sendMediaUrlToChannels,
  sendInstagramToGroups,
  sendInstagramToChannels,
}