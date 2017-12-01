// Dependencies
var request = require('request'),
    Twitter = require('twitter'),
    config = require('./config.json')

// Config options
const POSTS_PER_INTERVAL = 100,
      INTERVAL_MINUTES = 5,
      MIN_SCORE = 2000,
      MAX_TWEET_TEXT_COUNT = 140,
      SUBREDDITS = config.subreddits

var bot = new Twitter({
    'consumer_key': config.consumer_key,
    'consumer_secret': config.consumer_secret,
    'access_token_key': config.access_token,
    'access_token_secret': config.access_token_secret
});

// var marker = [];
var url = 'https://www.reddit.com/r/' + SUBREDDITS.join('+') +'/hot.json?t=day';

TopReddit();
setInterval(TopReddit, (INTERVAL_MINUTES * 60 * 1000));

// This function will be called during every interval
function TopReddit() {
    request({
	url: url,
	json: true
    }, function (error, response, body) {
	if (!error && response.statusCode === 200) {
    	    console.log('Tweeting...');
	    
	    var posts = body.data.children;
	    
	    // Go through all the reddit posts that have been fetched from reddit API earlier
	    for (i = 0; i < posts.length; ++i) {
		var linkSuffix = ' ' +  posts[i].data.url;//' http://redd.it/' + posts[i].data.id;
		var subreddit = '[r/' + posts[i].data.subreddit + '] ';
		var title = subreddit + posts[i].data.title;
		
	    	// Trim the title if total tweet length exceeds 140 characters
	    	while (title.length > MAX_TWEET_TEXT_COUNT) {
	    	    title = title.substring(0, title.lastIndexOf(' ')) + '...';
	    	}
		
		// Post tweet
	    	var tweet_post = title + linkSuffix;
		bot.post('statuses/update', {status: tweet_post}, function(error, tweet, response) {
		    if (!error) {
			console.log(tweet);
		    } else {
			console.log(error);
		    }
		});
	    }
	} else {
    	    console.error('An error occurred while fetching data from: ' + url + '\nResponse: ' + response.statusCode  + '\n'  + error);
	}
    })
}
