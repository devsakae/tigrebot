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
  site_publish
};
