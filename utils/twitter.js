const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function postTweet(tweetText) {
  try {
    const tweet = await client.v2.tweet(tweetText);
    return console.info('Tweet postado! Veja em https://twitter.com/Tigrelog/status/' + tweet.data.id)
  } catch (error) {
    console.error(`Failed to post tweet: ${error}`);
  }
}

module.exports = {
  postTweet,
}