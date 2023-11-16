const prompts = require('../src/bolao/data/prompts.json');

const help = () => {
  let response = prompts.admin.help;
  response += prompts.admin.mod_quotes;
  response += prompts.admin.mod_jogounotigre;
  response += prompts.admin.mod_jokes;
  response += prompts.admin.mod_stats;
  response += prompts.admin.mod_narrador;
  response += prompts.admin.mod_bolao;
  return response;
}

module.exports = {
  help
}