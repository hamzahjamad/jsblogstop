var jsFadeRotate = function(){
	var init = function(){
		$(".js-fade-rotate").each(function(){
			var $rotate = $(this),
				options = {"delay": 10000, "hover-pause": true, "hover-select": true},
				timeout,
				$items = new Array(),
				$selectors = new Array(),
				i=0,
				init = function(){
					loadOptions();					
					
					$rotate.children(".js-rotate-item").each(function(){
						$items.push($(this));									
					});
					if(options["hover-pause"]){
						$rotate.hover(stop, start);
						if(options["hover-select"]){
							$selectors = new Array();
							var $selects = $("<div class='js-rotate-hover-selectors'></div>");
							for(var j=0; j < $items.length; j++){
								selector = $("<span class='js-hover-selector'></span>").click({"item": j}, select);
								$selects.append(selector);
								$selectors.push(selector);
							}
							$selectors[i].addClass("js-hover-selector-active");
							$rotate.append($selects);
						}						
					}
					fadeIn();
				},
				loadOptions = function(){
					var tempOpts = $.parseJSON($rotate.attr("data-options"));
					for(key in tempOpts){//Override Defaults if specified
						options[key] = tempOpts[key];
					}
					tempOpts = null;
				},
				select = function(event){
					if(i != event.data.item){
						$items[i].fadeOut('fast', function(){
							setSelectors(event.data.item);
							i = event.data.item;
							$items[i].fadeIn('fast');
						});
					}					
				},
				fadeIn = function(){
					$items[i].fadeIn('slow', delay);
				},
				delay = function(){
					timeout = self.setTimeout(fadeOut, options["delay"]);
				},
				fadeOut = function(){
					clearTimeout(timeout);
					$items[i].fadeOut('slow', next);
				},
				stop = function(){
					clearTimeout(timeout);
					reset();
				},
				start = function(){
					reset();
					timeout = self.setTimeout(fadeOut, options["delay"]);
				},
				reset = function(){
					for(var n=0; n < $items.length; n++){
						if (i != n) {
			   			$items[n].hide();
			   		}
						else{
							$items[n].show();
						}
					}					
				},
				next = function(){
					if(i < $items.length-1){
						setSelectors(i+1);
						i++;
					}
					else{
						setSelectors(0);
						i=0;
					}					
										
					fadeIn();
				},
				setSelectors = function(next){
					if(options["hover-select"] && options["hover-pause"]){
						$selectors[i].removeClass("js-hover-selector-active");
						$selectors[next].addClass("js-hover-selector-active");
					}
				};
				
			init();
		});
	};
	$(document).ready(init);
}();