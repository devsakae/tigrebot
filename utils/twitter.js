const { TwitterApi } = require('twitter-api-v2');
const config = require('../data/tigrebot.json');
const { log_this, log_erro } = require('./admin');

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const cutToFit = text => text.length < 280 ? text : text.substring(0, 235) + '\n\nLeia + em ' + config.mysite;

const postTweet = async text => {
  try {
    const tweet = await client.v2.tweet(cutToFit(text));
    log_this('Tweet postado! Veja em https://twitter.com/Tigrelog/status/' + tweet.data.id)
    return tweet.data.id;
  } catch (error) {
    return console.error(`Failed to post tweet: ${error}`);
  }
}

const replyTweet = async ({ id, text }) => {
  try {
    //const tweet = await client.v1.reply(text, id);
    const tweet = await client.v2.reply({ status: text, toTweetId: id });
    log_this('Tweet postado! Veja em https://twitter.com/Tigrelog/status/' + tweet.data.id)
    return tweet.data.id;
  } catch (err) {
    return console.error('Erro ao responder ao tweet');
  }
}

const postMediaTweet = async ({ media, text }) => {
  try {
    const source = Buffer.from(media.data, 'base64');
    const mediaId = await client.v1.uploadMedia(source, { mimeType: media.mimetype });
    const tweet = await client.v2.tweet({ text: cutToFit(text), media: { media_ids: [mediaId] } });
    return log_this('Tweet postado! Veja em https://twitter.com/Tigrelog/status/' + tweet.data.id)
  } catch (error) {
    return log_erro(`Failed to post tweet: ${error}`);
  }
}

const getUserPost = async (user) => {
  try {
    // const userTweets = await client.v2.get('users/' + user + '/tweets');
    const userTweets = await client.v1.get('statuses/user_timeline.json', { user_id: user });;
    console.info(userTweets);
    return;
  } catch (err) {
    return log_erro(err);
  }
}

module.exports = {
  postTweet,
  postMediaTweet,
  replyTweet,
  getUserPost,
}