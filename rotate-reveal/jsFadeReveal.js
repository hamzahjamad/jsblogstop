var jsFadeReveal = function(){
	var init = function(){
		$(".js-fade-reveal").each(function(){
			var $reveal = $(this),
				options = {"delay": 1000, "hover-pause": false, "repeat": false, "repeat-delay": 2000}, 
				timeout,
				$items = new Array(),
				i=0,
				init = function(){
					loadOptions();
					
					//Set Hover event handlers if Repeat and Hover options are set
					if(options["hover-pause"] && options["repeat"]){
						$reveal.hover(stop, start);
					}
					$reveal.children(".js-reveal-item").each(function(){
						$items.push($(this));
					});
					fadeIn();
				},
				loadOptions = function(){
					var tempOpts = $.parseJSON($reveal.attr("data-options"));
					for(key in tempOpts){//Override Defaults if specified
						options[key] = tempOpts[key];
					}
					tempOpts = null;
				},
				fadeIn = function(){
					$items[i].fadeIn('slow', pause);
				},
				pause = function(){
					timeout = self.setTimeout(next, options["delay"]);
				},
				next = function(){
					if(i < $items.length-1){
						i++;
						fadeIn();
					}
					else if(options["repeat"]){
						reset();
						i=0;
						timeout = self.setTimeout(fadeIn, options["repeat-delay"]);						
					}
				},
				stop = function(){
					options["repeat"] = false;
				},
				start = function(){
					options["repeat"] = true;
					if(i == $items.length-1){
						next();
					}					
				},
				reset = function($item){
					$items.forEach(function($item){
						$item.fadeOut(options["repeat-delay"]*.9);
					});					
				};							
			init();
		});
	};
	$(document).ready(init);
}();