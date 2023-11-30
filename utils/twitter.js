const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function postTweet(tweetText) {
  try {
    let texto = tweetText
    if (tweetText.length > 280) texto = tweetText.substring(0, 230) + '...\n\n👉 Leia a íntegra em devsakae.tech/tigrebot'
    const tweet = await client.v2.tweet(texto);
    return console.info('Tweet postado! Veja em https://twitter.com/Tigrelog/status/' + tweet.data.id)
  } catch (error) {
    console.error(`Failed to post tweet: ${error}`);
  }
}

module.exports = {
  postTweet,
}