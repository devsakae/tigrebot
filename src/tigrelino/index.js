const { sendTextToGroups } = require("../../utils");

const publicarComoTigrelino = async (m) => await sendTextToGroups(m.body);

module.exports = {
  publicarComoTigrelino,
}
