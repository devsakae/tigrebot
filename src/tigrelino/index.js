const config = require('../../data/tigrebot.json');
const { sendTextToGroups } = require("../../utils");

const publicarComoTigrelino = async (m) => await sendTextToGroups(m.body);

const desTigrelinizar = async (m) => {
  config.tigrelino = false;
  saveLocal(config);
};

module.exports = {
  publicarComoTigrelino,
  desTigrelinizar,
}
