const { fetchApi, fetchWithParams } = require('./fetchApi');
const { saveLocal } = require('./handleFile');
const {
  sendInstagramToChannels,
  sendInstagramToGroups,
  sendMediaUrlToChannels,
  sendMediaUrlToGroups,
  sendTextToChannels,
  sendTextToGroups,
} = require('./sender');
const { site_publish } = require('./mongo');
const { publicidade } = require('./marketing');
const { log_erro, log_info, log_this } = require('./admin');
/* const { postTweet, replyTweet } = require('./twitter'); */

module.exports = {
  fetchApi,
  fetchWithParams,
  saveLocal,
  sendInstagramToChannels,
  sendInstagramToGroups,
  sendMediaUrlToChannels,
  sendMediaUrlToGroups,
  sendTextToChannels,
  sendTextToGroups,
  site_publish,
  publicidade,
  log_erro,
  log_info,
  log_this,
  /* postTweet,
  replyTweet, */
};
