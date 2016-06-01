var jsTweetBox = function(){
  this.updateTimelines = function(){
  	$(".twtr-tweet").each( function(){ //update Since Times on tweets
  		var $timestamp = $(this).find(".tweet-timestamp");
		$timestamp.text(getSinceTime($timestamp.attr("data-timestamp")));
	});
  };
  var $T,
  	$currentUser,
	$authReaction,
  	$pub,
	$pubFollow,
	$twtBox,
	$twtCount,
	$twtStatus,
	$twtMsg,
	$twtButton,
	$tweetTemplate,
	strBitlyLogin,
	strBitlyKey,
	strBaseURL,
	timerUpdate,
  init = function(){  	
    twttr.anywhere(initAnywhere);
  },
  initAnywhere = function(T){
   $T = T;	
   $twtBox = $("#js-tweet-box");	
	$twtBox.append("<div class='js-sidebar'></div><div class='js-reactions'>React on Twitter...<textarea name='js-tweet-box' rows='4' cols='50'></textarea>"
		 + "<div style='text-align: center;'>"
	    + "<div class='js-tweet-count'>140</div>"
	    + "<div class='js-tweet-button button'>Tweet</div>"
	    + "<span class='js-tweet-message'></span>"
		 + "<div style='clear: both;'></div></div>"
		 + "<div class='js-auth-reaction'><h1>You Tweeted...</h1></div>"
  	+ "</div>");
	
	$authReaction = $twtBox.find(".js-auth-reaction");
	
   $twtCount = $("#js-tweet-box .js-tweet-count");

	$currentUser = $("<div class='js-current-user-twitter'></div>");
	updateCurrentUser();
	$twtBox.find(".js-sidebar").append($currentUser);

   $twtMsg = $("#js-tweet-box .js-tweet-message");
   $twtButton = $("#js-tweet-box .js-tweet-button");
   $twtButton.click(tweet);
   
   $twtStatus = $("#js-tweet-box textarea[name=js-tweet-box]");
   $twtStatus.bind("keyup update focus focusout paste blur", updateCount);
	 
	var strPub = $("#js-tweet-box").attr("data-publisher");
  	if(strPub) { //Add a Follow Me Button if A Publisher is supplied
		$T.User.find(strPub, addFollowMe);
	}
		
   getShortURL();	 
	getTweetCount();
   updateCount();
	buildTweetTemplate();
	getRecentTweets();
	timerUpdate = self.setInterval("jsTweetBox.updateTimelines()", 60*1000); //Once per minute, update timelines
	strPub = null;
  },
  getRecentTweets = function(){
	$.ajax({
	  url: "http://search.twitter.com/search.json",
	  dataType: 'jsonp',
	  data: {q: strBaseURL},
	  success: processRecentTweets, 
	  error: errorRecentTweets
	});
	
	//$T.Status.search(strBaseURL, {success: processRecentTweets, error: errorRecentTweets});
  },
  buildTweetTemplate = function(){
  	$tweetTemplate = $('<div class="twtr-tweet"><div class="twtr-img"><a><img></a></div>' +
   		'<div class="twtr-tweet-text"><div class="tweet-row"></div></div>' +
   		'<span class="tweet-timestamp"></span><span class="tweet-actions"></span><div style="clear: both;"></div></div>');
			
	$tweetTemplate.find(".twtr-img a")
		.attr("target", "_blank")
		.attr("rel", "nofollow")
		.attr("alt", "Profile Pic");
  },
  formatJSON = function(object){  //Resolves naming convention differences between @Anywhere and Search API
		for(var prop in object){
			if (typeof(object[prop])=="object") {//recursively traverse down tree
                formatJSON(object[prop]);
        	}
			object[camelCaseString(prop)] = object[prop];
			//delete object[prop]; How do I know when this is needed or is it at all?
		}
  },
  camelCaseString = function(str){ //Converts a _ delimited string to a camelCase format
  	return str.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
  },
  processRecentTweets = function(json){
	if (json.results.length > 0) {
   	var $recentTweets = $("<div class='js-recent-tweets'><h1>Recent Tweets <span>within 4 days</span></h1></div>"), 
		$status,
		curStatus;
   	
   	for(var i = json.results.length - 1; i >= 0; i--) {
   		curStatus = json.results[i];
			formatJSON(curStatus);
   		$status = $tweetTemplate.clone();
   		
   		$status.find(".twtr-img a").attr("href", "http://www.twitter.com/" + curStatus.fromUser);
   		$status.find(".twtr-img img").attr("src", curStatus.profileImageUrl);
   		$status.find(".tweet-row").html(curStatus.fromUser);// + " " + curStatus.name);
			$status.find(".twtr-tweet-text").append(linkifyStatus(curStatus.text));
			$status.find(".tweet-timestamp").attr("data-timestamp", curStatus.createdAt).html(getSinceTime(curStatus.createdAt));
			
			if(!$T.currentUser || $T.currentUser.screenName != curStatus.fromUser){
				//$status = addUserActions($Tweet, jsonTweet);
				$status = addTweetActions($status, curStatus, false);
			}
			else {
				$status = addTweetActions($status, curStatus, true);
			}
			$recentTweets.append($status);
		}
		$twtBox.find(".js-reactions").append($recentTweets);
		
		$recentTweets = null;		
		$status = null;
		curStatus = null;
	}
  },
  addTweetActions = function($Tweet, jsonTweet, isAuth){
		var $Actions = $Tweet.find(".tweet-actions");
		$Actions.attr("data-item-id", jsonTweet.idStr)
			.attr("data-user-id", jsonTweet.fromUser);
			
		if(isAuth){
			buildAction($Actions, false, "Remove", remove);	
		}
		else {
			//buildAction($Actions, false, "Reply", reply);
			buildAction($Actions, jsonTweet.retweeted, "Retweet", retweet);
			buildAction($Actions, jsonTweet.favorited, "Favorite", favorite);
		}

		return $Tweet;
	},
	buildAction = function($Actions, acted, text, handler){
		var $Action = $("<span><span class='sprite'></span></span>");
		var strClick = ""; //"twtrTweet.";
		
		$Action.addClass("tweet-" + text.toLowerCase());
		if(acted){
			$Action.find(".sprite").toggleClass("sprite active-sprite");			
			$Action.append("Undo " + text);
			switch (text){ //set handlers for undos
				case "Retweet": handler = unretweet;
					break;
				case "Favorite": handler = unfavorite;
					break;
			}
		}
		else{
			$Action.append(text);
		}
		
		$Action.click(handler); 
		$Actions.append($Action);
	},
	remove = function(event){
		var $action = $(this);
		//failing due to id vs idStr differences, bypassed for now
		$T.requireConnect(function(){
			$T.Status.find($action.parent().attr("data-item-id")).destroy(
				{success: function(response){
					$action.parent().parent().fadeOut('fast')
						.remove();
					if($authReaction.find(".twtr-tweet").length < 1){
						$authReaction.fadeOut('fast');
					}
				},
				error: function(error){
					//do nothing for now, but I should display an error message
					error = error;
				}
			});
		});
	},
	favorite = function(event){
		var $action = $(this);
		
		$T.requireConnect(function(){
	  		$T.Status.favorite($action.parent().attr("data-item-id"),
				{success: function(){
					actionUpdate($action, "active-sprite", "Unfavorite", unfavorite);
				},
				error: function(error){
					//do nothing for now, but I should display an error message
					error = error;
				}
			});	  		
	  	});
	},
	unfavorite = function() {
		var $action = $(this);
		
		$T.requireConnect(function(){
			$T.Status.unfavorite($action.parent().attr("data-item-id"),
				{success: function(){
					actionUpdate($action, "sprite", "Favorite", favorite);
				},
				error: function(error){
					//do nothing for now, but I should display an error message
				}
			});
			
		});		
	},
	retweet = function(){
		var $action = $(this);
		
		$T.requireConnect(function(){
			$T.Status.retweet($action.parent().attr("data-item-id"),
				{success: function(){
					actionUpdate($action, "active-sprite", "Undo Retweet", unretweet);
				},
				error: function(error){
					//do nothing for now, but I should display an error message
				}
			});
		});		
	},
	unretweet = function(){
		var $action = $(this);
		
		$T.requireConnect(function(){
			$T.Status.remove($action.parent().attr("data-item-id"),
				{success: function(){
					actionUpdate($action, "sprite", "Retweet", retweet);
				},
				error: function(error){
					//do nothing for now, but I should display an error message
					error = error;
				}
			});
			
		});		
	},
	reply = function(){
//		var userReply = $("#" + $(this).parent().attr("data-tweet-id")).attr("data-user-id");
//		tweetBox.setReply(replyID, userReply);
	},
	actionUpdate = function($action, sprite, text, handler){
		$action.unbind();
		$action.html("<span class='" + sprite + "'></span>" + text);
		$action.click(handler);
	},	
  errorRecentTweets = function(error){
	
  },
  getSinceTime = function(dateString) {
	var rightNow = new Date();
	var then = new Date(dateString);
	var strTimeAgo = "";
	then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));

	var diff = rightNow - then;

	var second = 1000,
		minute = second * 60,
		hour = minute * 60,
		day = hour * 24,
 		week = day * 7;

	if (isNaN(diff) || diff < 0) {
		strTimeAgo = ""; // return blank string if unknown
	}
	else if (diff < second * 2) {
		strTimeAgo = "right now";
	}
	else if (diff < minute) {
		strTimeAgo = Math.floor(diff / second) + " seconds ago";
	}
	else if (diff < minute * 2) {
	  	strTimeAgo = "about 1 minute ago";
	}
	else if (diff < hour) {
	  	strTimeAgo = Math.floor(diff / minute) + " minutes ago";
	}
	else if (diff < hour * 2) {
	  	strTimeAgo = "about 1 hour ago";
	}
	else if (diff < day) {
	  	strTimeAgo =  Math.floor(diff / hour) + " hours ago";
	}
	else if (diff > day && diff < day * 2) {
	  	strTimeAgo = "yesterday";
	}
	else if (diff < day * 365) {
	  	strTimeAgo = Math.floor(diff / day) + " days ago";
	}
	else {
	  	strTimeAgo = "over a year ago";
	}
	return strTimeAgo;
  },
  linkifyStatus = function(text) {
    text = text.replace(/(https?:\/\/\S+)/gi, function (s) {
        return '<a target="_blank" rel="nofollow" href="' + s + '">' + s + '</a>';
    });

    text = text.replace(/(^|)@(\w+)/gi, function (s) {
        return '<a target="_blank" rel="nofollow" href="http://twitter.com/' + s + '">' + s + '</a>';
    });

    text = text.replace(/(^|)#(\w+)/gi, function (s) {
        return '<a target="_blank" rel="nofollow" href="http://twitter.com/#!/search/' + s.replace(/#/,'%23') + '">' + s + '</a>';
     });
    return text;
},
  updateCurrentUser = function(){
  	if($T.isConnected()){
		$currentUser.html("<div>" + $T.currentUser.name + "<img src='" + $T.currentUser.profileImageUrl + "' title='Connected as " + $T.currentUser.screenName + "'></div><div class='button'>Connected</div>");
		$currentUser.show();		
	}
	else{
		$currentUser.hide();
	}
	setFollowMeVisibility();
  },
  setFollowMeVisibility = function(){
  	if($pubFollow) {
		if($T.isConnected() && $T.currentUser.screenName == $twtBox.attr("data-publisher")){
			$pubFollow.hide();
		}
		else{
			$pubFollow.show();
		}
	}
  },
  addFollowMe = function(user){
	$pub = user;
	$pubFollow = $("<div class='js-publisher'><div>" + $pub.screenName + "<img class='js-publisher-img'  src='" + $pub.profileImageUrl + "'></div><div class='button'></div></div>");
	var $followButton = $pubFollow.find(".button");
	if($pub.following){
		$followButton.attr("title", "Click to stop following " + $pub.screenName);
		$followButton.html("Unfollow");
		$followButton.click(unfollowPublisher);
	}
	else{
		$followButton.attr("title", "Follow " + $pub.screenName + " on Twitter");
		$followButton.click(followPublisher);
		$followButton.html("Follow");
	}
	$twtBox.find(".js-sidebar").append($pubFollow);
	setFollowMeVisibility();
	
	$followButton = null;
  },
  unfollowPublisher = function(){
  	$T.requireConnect(function(){
			updateCurrentUser();
	  		$pub.unfollow(
				{
					success: function(response){
						var $button = $pubFollow.find(".button");
						showMessage("No longer Following " + $pub.screenName);
						$button.unbind();
						$button.click(followPublisher);
						$button.attr("title", "Follow " + $pub.screenName + " on Twitter");
						$button.html("Follow");
						$button = null;
					},
					error: function(response){
						showMessage("Unfollow Attempt Failed");
						setFollowMeVisibility();
					}
				}
			);
 		}
	);
  },
  followPublisher = function(){
  	$T.requireConnect(function(){
			updateCurrentUser();
	  		$pub.follow(
				{
					success: function(response){
						var $button = $pubFollow.find(".button");
						showMessage("Thanks for Following!");
						$button.attr("title", "Click to stop following " + $pub.screenName);
						$button.unbind();
						$button.click(unfollowPublisher);
						$button.html("Unfollow");
						$button = null;
					},
					error: function(response){
						showMessage("Follow Attempt Failed");
						setFollowMeVisibility();
					}
				}
			);
 		}
	);
  },
  getTweetCount = function(){
  	var $pageTweetCount = $("#js-page-tweet-count");
   if($pageTweetCount.length > 0){
   	$.getJSON("http://urls.api.twitter.com/1/urls/count.json?callback=?",
      	{url: strBaseURL},
         function(json){$pageTweetCount.text(json.count);});
   }
  },
  getShortURL = function(){
  	strBitlyLogin 	= $twtBox.attr("data-bitly-login");
	strBitlyKey 	= $twtBox.attr("data-bitly-key");
	
	strBaseURL = document.location.href.split("?")[0].split("#")[0];
	if(strBitlyLogin && strBitlyKey){ //get short URL if needed data is in place
		$.getJSON("http://api.bit.ly/v3/shorten?callback=?", 
      { format: "json",
        login: strBitlyLogin, 
        apiKey: strBitlyKey,
        longUrl: strBaseURL},
      processShortURL);
	}	
  },
  processShortURL = function(json){
    $twtStatus.val(json.data.url);
  },
  updateCount = function(){
    var nCount = $twtStatus.val().length;
    $twtButton.unbind();
    
    if(nCount <= 140){ //Only bind the key if tweet is valid length
		$twtButton.click(tweet);
		$twtCount.removeClass("js-tweet-count-over");
		$twtButton.removeClass("disabled-button");			
    }
    else {
		$twtCount.addClass("js-tweet-count-over");
		$twtButton.addClass("disabled-button");	
    }
				
    $twtCount.html(140-nCount);
    nCount = null;
  },
  tweet = function(){
    if($T.isConnected()){//Always a valid length, otherwise the tweet button is unbound
      updateStatus();
    }
    else{//prompt for a Login and callback to this function on Success, loginError on failure
      $T.requireConnect(updateStatus);
    }
  },
  updateStatus = function() {
  	updateCurrentUser();
  	$T.Status.update($twtStatus.val(), {
   	success: function(response){
   		showMessage("Status Updated");
			addAuthReaction(response);
			$authReaction.fadeIn('slow');
    		$twtStatus.val("");
    		updateCount();
   	},
   	error: function(response){
   		showMessage("An Error Occurred: Try again");
			//updateStatus();
   	}
   });
  },
  addAuthReaction = function(reaction) {
  	var $status = $tweetTemplate.clone(),
		$Actions = $status.find(".tweet-actions");
	
	$status.find(".twtr-img a").attr("href", "http://www.twitter.com/" + reaction.user.screenName);
	$status.find(".twtr-img img").attr("src", reaction.user.profileImageUrl);
	$status.find(".tweet-row").html(reaction.user.screenName);// + " " + reaction.user.name);
	$status.find(".twtr-tweet-text").append(linkifyStatus(reaction.text));
	$status.find(".tweet-timestamp").attr("data-timestamp", reaction.createdAt).html(getSinceTime(reaction.createdAt));
	
	$Actions.attr("data-item-id", reaction.idStr);
	buildAction($Actions, false, "Remove", remove);
	$authReaction.append($status);
	
	$status = null;
	$Actions = null;
  }, 
  showMessage = function(strMsg){
    $twtMsg.text(strMsg)
      .fadeIn('fast', fadeMessage);
  },
  fadeMessage = function(){
    $twtMsg.fadeOut(3000);
  };
  $("head").append("<link id='js-tweet-box-styles' rel='stylesheet' type='text/css' href='http://jsblogstop.googlecode.com/svn/jstweetbox/dev/jsTweetBox.css'/>");
  $(document).ready(init);
  return this;
}();