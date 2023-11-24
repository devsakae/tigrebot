const { MessageMedia } = require("whatsapp-web.js");
const { client } = require("../connections");
const { tigrelino } = require('../../data/tigrebot.json')

const publicarComoTigrelino = async (m) => {
  const raw = await m.getQuotedMessage();
  if (raw.hasMedia) {
    const media = await raw.downloadMedia();
    if (media) {
      const contentComMedia = new MessageMedia(
        media.mimetype,
        media.data.toString('base64')
      );
      await client.sendMessage(tigrelino.canal, contentComMedia, { caption: raw.body })
    }
  }
  return await client.sendMessage(tigrelino.canal, raw.body);
}
