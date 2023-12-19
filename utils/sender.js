const { client } = require('../src/connections');
const config = require('../data/tigrebot.json');
const { MessageMedia } = require('whatsapp-web.js');

const sendTextToGroups = async text => {
  for (dest of Object.keys(config.grupos)) {
    await client.sendMessage(dest, text)
  }
}

const sendTextToChannels = async text => {
  for (dest of Object.keys(config.canais)) {
    await client.sendMessage(dest, text)
  }
}

const echoToGroups = async text => await Promise.all(Object.keys(config.grupos).map(async g => await client.sendMessage(g, text)));
const echoToChannel = async text => await Promise.all(Object.keys(config.canais).map(async c => await client.sendMessage(c, text)));

const sendBolaoGroups = async text => {
  for (grupo of Object.keys(config.bolao.grupos)) {
    await client.sendMessage(grupo, text);
  }
};

const sendMediaUrlToGroups = async media => {
  for (grupo of Object.keys(config.grupos)) {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    await client.sendMessage(grupo, mediaFile, { caption: media.caption })
  }
}

const sendMediaUrlToChannels = async media => {
  for (grupo of Object.keys(config.canais)) {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    await client.sendMessage(grupo, mediaFile, { caption: media.caption })
  }
}

const sendInstagramToGroups = async media => {
  for (grupo of Object.keys(config.grupos)) {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link + '\nCapturado e enviado até você por TigreBot (devsakae.tech/tigrebot)';
    await client.sendMessage(grupo, mediaFile, { caption: newCaption });
  }
}

const sendInstagramToChannels = async media => {
  for (canal of Object.keys(config.canais)) {
    const mediaFile = await MessageMedia.fromUrl(media.url);
    const newCaption = media.caption + '\n\n📷 @' + media.owner + '\n🔗 ' + media.link;
    await client.sendMessage(canal, mediaFile, { caption: newCaption });
  }
}

module.exports = {
  sendTextToGroups,
  sendTextToChannels,
  sendMediaUrlToGroups,
  sendMediaUrlToChannels,
  sendInstagramToGroups,
  sendInstagramToChannels,
  sendBolaoGroups,
  echoToGroups,
  echoToChannel,
}