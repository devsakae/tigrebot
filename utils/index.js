const { help } = require('./help');
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

module.exports = {
  help,
  fetchApi,
  fetchWithParams,
  saveLocal,
  sendInstagramToChannels,
  sendInstagramToGroups,
  sendMediaUrlToChannels,
  sendMediaUrlToGroups,
  sendTextToChannels,
  sendTextToGroups,
};
