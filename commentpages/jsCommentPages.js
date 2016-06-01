var jsCommentPages = function(){
	var $activePage,
		$activeTab,
		init = function(){	
			$(".comments-tab").each(function(){
				var $tab = $(this);
				$tab.click(selectPage)
					.addClass("js-inactive-tab");
				switch ($tab.attr("id")){
					case "blogger-comments": 
						$tab.prepend("<img src='http://lh6.googleusercontent.com/-_InM8Yxvqlg/Tg03QmGCkDI/AAAAAAAAAd8/Ozlnv5wP_C8/s800/blogger-white-B.png'>");
						break;
					case "twitter-comments":
						$tab.prepend("<img src='http://lh6.googleusercontent.com/-7o7PRftYZaA/Tg0194rd1KI/AAAAAAAAAd4/0FEbtbBl760/s800/white-twitter-bird.png'>");
						break;
					case "fb-comments":
						$tab.prepend("<img src='https://1.bp.blogspot.com/-iLm6o-MThpc/VbwG96FuaaI/AAAAAAAAAbk/YM4hNetFGkk/s1600/1438394818_Socialmedia_icons_Facebook.png'>");
						break;
				}
				$tab = null;
			});
						
			getTweetCounts();
			
			var $default = $(".js-default-tab:first"),
				strDefault = "#blogger-comments";
			if($default.length > 0){
				strDefault = "#" + $default.attr("id");
			}
			//Set default tab and page Active
			$activeTab = $(strDefault);
			$activeTab.removeClass("js-inactive-tab");
			
			$activePage = $(strDefault + "-page");			
			$activePage.show();
		},
		getTweetCounts = function(){
		  	$(".js-page-tweet-count").each(
				function(){
					var $count = $(this);
					$.getJSON("http://urls.api.twitter.com/1/urls/count.json?callback=?",
		      	{url: $count.attr("href")},
		         function(json){$count.text(json.count);$count = null;});					   	
				}
			);		   
 	 	},
		selectPage = function() {
			//Set old tab inactive, then set clicked tab active
		  	$activeTab.addClass("js-inactive-tab");
			$activeTab = $(this);
		  	$activeTab.removeClass("js-inactive-tab");
			
			//hide active page, then switch to page associated to clicked tab
		  	$activePage.hide();
		  	$activePage = $("#" + $activeTab.attr("id") + "-page");
		  	$activePage.show();
		};
	$("head").append("<link id='js-comments-pages-styles' rel='stylesheet' type='text/css' href='https://cdn.rawgit.com/hamzahjamad/jsblogstop/master/commentpages/jsCommentPages.css'/>");
  	$("document").ready(init);
}();
