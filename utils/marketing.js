const prompts = require('../data/prompts.json');

const publicidade = () => prompts.marketing[Math.floor(Math.random() * prompts.marketing.length)];

module.exports = {
  publicidade,
}