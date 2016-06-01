var jsItemGroups = function(){
	var groups = new Array(),
		init = function(){
   	$(".js-item-group").each(function(){
			groups.push(new jsItemGroup($(this)));
		});
   }; 
	function jsItemGroup($newGroup){
   	var $group = $newGroup, 
			$items = new Array(),
			$wrapper,
			navigator,
			currentItem = 0, 
			defaults = {
				"animation": "fade",
				"animation-time": "600",
				"item-height": "auto",
				"item-width": "auto",
				"orrientation": "horizontal",
	   		"auto-nav-time": 10000,
				"auto-nav": true,
	   		"manual-nav": true,
	   		"manual-nav-style": "buttons"
   		},
			options = defaults;
   	
   	//Begin Item Group General Methods
		var init = function(){
			loadObjOptions($group, options);
			validateOptions();
			
			$group.children(".js-item").each(function(){
				var $item = $(this);
				$items.push($item);
				
				//Resize Items if valid number options were supplied
				if (typeof(options["item-width"]) == "number") {
					$item.css("width", options["item-width"]);
				}
				else { //Default to width of the Group
					$item.css("width", $group.width());
				}
				if (typeof(options["item-height"]) == "number") {
					$item.css("height", options["item-height"]);
				}
				else { //TODO: hmm, I'm resizing the container for sliders later. I think the sizing is a little chaotic atm
					//Allow items to stay auto height
				}
			});
			wrapItems();
			$items[currentItem].show();
						
			navigator = new itemNavigator();
			navigator.init();
		},
		wrapItems = function(){ //Used for Slide Masking and background styling
			$group.find(".js-item").wrapAll("<div class='js-group-wrapper'></div>");
			$wrapper = $group.find(".js-group-wrapper");
		},
		validateOptions = function(){
			//TODO: Make sure user specified options are valid, reset invalids to default			
			//Do I really need to do this or just let it error out?
		},
		loadObjOptions = function($object, arrOpts){
			var tempOpts = $.parseJSON($object.attr("data-options"));
			for (key in tempOpts) {//Override Defaults if specified
				arrOpts[key] = tempOpts[key];
			}
			tempOpts = null;
			return arrOpts;
		};
		//End General Methods
		
		//Begin Navigation Objects
		function itemNavigator(){
			//Begin Private(closure) Methods/Attributes
			var $navs,
				$navGroup,
				navEngine,
			
			selectItem = function(event){ 
				navEngine.select(event.data.item);
			},
			addManualNav = function(){ //Creates the appropriate Manual Navigation controls
				$navs = new Array();
				$navGroup = $("<div class='js-nav-group'></div>");
				
				switch (options["manual-nav-style"]) {
					case "tabs":
						addTabs();						
						break;
						
					default: //defaults to buttons
						addButtons();
						break;
				};
				$navs[currentItem].addClass("active");				
			},
			addButtons = function(){
				for (j = 0; j < $items.length; j++) {
					$nav = $("<span class='js-item-nav'></span>").click({"item": j}, selectItem);
					$nav.addClass("button");
					
					var itemOpts = {"label": ""};
					loadObjOptions($items[j], itemOpts);
					$nav.text(itemOpts["label"]);
					
					$navGroup.append($nav);
					$navs.push($nav);
				}
				$navGroup.addClass("buttons");
				$group.append($navGroup);
			},
			addTabs = function(){
				for (var j = 0; j < $items.length; j++) {
					var $nav = $("<span class='js-item-nav'></span>").click({"item": j}, selectItem);
					
					$nav.addClass("tab");
					
					var itemOpts = {"label": "Page " + (j + 1)};
					loadObjOptions($items[j], itemOpts);
					$nav.text(itemOpts["label"]);
					
					$navGroup.append($nav);
					$navs.push($nav);
				}
				
				if(options["animation"] != "slide"){
					$wrapper.addClass("js-tabbed-group");
				}
				$navGroup.addClass("tabs");
				$group.prepend($navGroup);
			},
			setActiveNav = function(next){
				if (options["manual-nav"]) {
					$navs[currentItem].removeClass("active");
					$navs[next].addClass("active");
				}
			}, 
			addAutoNav = function(){ //Sets automated navigation based on options
				switch (options["animation"]) {
					case "fade":
						$wrapper.addClass("js-fade-rotator");
						navEngine = new fadeNavigator();
						break;
						
					case "slide":						
						navEngine = new slideNavigator();
						break;
						
					default:
						//None specified, so do nothing
						break;
				}
			};
			//End Private(closure) Methods/Attributes
			
			//Begin Public Methods/Attributes
			this.init = function(){
				if (options["manual-nav"]) {
					addManualNav();
				}
				if(options["auto-nav"]){
					addAutoNav();
				}						
			}
			//End Public Methods/Attributes
			
			//Begin Nav Engine Objects			
			function slideNavigator(){
				var timeout,
					offsetSide,
					itemOffsets = new Array(),
					$slider,
					$arrows = {},
				init = function(){
					//Add neccessary Slider wrapper to hide overflow and include manual navigation
					$wrapper.wrap("<div class='js-slider'></div>");
					$slider = $group.find(".js-slider");	
					
					if(options["manual-nav-style"] == "tabs"){
						$slider.addClass("js-tabbed-group"); //TODO: this class name blows
					}
					
					var totalOffset = 0;
					
					if(options["orrientation"] == "vertical"){
						$group.addClass("js-vertical-slider");
						offsetSide = "top";
						for(var i=0;i < $items.length;i++){							
							itemOffsets.push(totalOffset);
							totalOffset -= $items[i].outerHeight(true);
						}
					}		
					else{
						$group.addClass("js-horizontal-slider");	
						offsetSide = "left";
						resizeWrappers();
						
						for(var i=0;i < $items.length;i++){
							itemOffsets.push(totalOffset);
							totalOffset -= $items[i].outerWidth(true);
						}
					}				
									
					addArrowNavs();
					$group.hover(stop, start);
					autoSlide();
				},
				addArrowNavs = function(){
					$arrows["prev-arrow"] = $("<span class='js-slider-prev-arrow'>&lt;</span>").click(prev);
					$arrows["next-arrow"] = $("<span class='js-slider-next-arrow'>&gt;</span>").click(next);
					
					$group.prepend($arrows["prev-arrow"])
							.prepend($arrows["next-arrow"]);
					
					var dimensions = {"width": $slider.width(), "height": $slider.height()};
					
					if (options["orrientation"] == "vertical") {
			   			//Center the buttons top and bottom of slider
							$arrows["prev-arrow"].css("left", $group.width()/2);
							$arrows["next-arrow"].css("left", $group.width()/2)
								.css("top", $group.height());								
				   }
					else{ //Place buttons vertically centered right and left of the slider
						$arrows["prev-arrow"].css("top", $group.height()/2);
						$arrows["next-arrow"].css("top", $group.height()/2)
								.css("left", $slider.width());
					}
				},
				getItemDimensions = function(){
					var dimensions = {"max-width": 0, "max-height": 0, "total-width": 0, "total-height": 0},
						itemHeight,
						itemWidth;
					
					for(var i=0;i < $items.length; i++){
						itemHeight 	= $items[i].outerHeight(true);
						itemWidth 	= $items[i].outerWidth(true);
						
						dimensions["total-height"] += itemHeight;
						dimensions["total-width"] 	+= itemWidth;
						
						if(dimensions["max-height"] < itemHeight){ 
							dimensions["max-height"] = itemHeight;
						}
						if(dimensions["max-width"] < itemWidth){ 
							dimensions["max-width"] = itemWidth;
						}
					}
					return dimensions;
				},
				resizeWrappers = function(){ 
					var dimensions = getItemDimensions();
					
					//Manual Size items if valid numbers. Otherwise, use auto sizing dimensions
					if(typeof(options["item-width"]) == "number"){
						dimensions["max-width"] 	= options["item-width"];
						dimensions["total-width"] 	= options["item-width"]*$items.length;
					}
					if(typeof(options["item-height"]) == "number") {
						dimensions["max-height"] 	= options["item-height"];
						dimensions["total-height"] = options["item-height"] * $items.length;
					}
					
					//Do the Resizing
					if(options["orrientation"] == "horizontal"){
						$group.css("height", "auto");
						$slider.css("height", "auto");
						$wrapper.css("width", dimensions["total-width"])
							.css("height", dimensions["max-height"]);
					}
					else { //Vertical layout, does this ever need resizing?
						
					}
				},
				prev = function(){ //Cycles endlessly atm
					if (currentItem > 0) {
						slide(currentItem - 1);
						currentItem--;
					}
					else {
						slide($items.length - 1);
					}
				},
				next = function(){ //Cycles endlessly atm
					if (currentItem < $items.length - 1) {
						slide(currentItem + 1);
					}
					else {
						slide(0);
					}
				},
				autoSlide = function(){
					if (currentItem < $items.length - 1) {
						slide(currentItem+1, delay);
					}
					else {
						slide(0, delay);
					}
				},
				delay = function(){
					timeout = self.setTimeout(autoSlide, options["auto-nav-time"]);
				},
				stop = function(){
					clearTimeout(timeout);
				},
				start = function(){
					timeout = self.setTimeout(autoSlide, options["auto-nav-time"]);
				},
				slide = function(nItem, complete){
					var opts = {};
					opts[offsetSide] = itemOffsets[nItem];
								
					$wrapper.animate(opts, options["animation-time"], function(){
						setActiveNav(nItem);
						currentItem = nItem;
						if(complete){
							complete.apply(this, []);
						}
					});
				};
				this.select = function(nItem){
					if (currentItem != nItem) {						
						slide(nItem);
					}
				};
				$(window).load(init); //It is very important Sliders wait until the objects are loaded to start
			};
			function fadeNavigator(){
				var timeout,
				init = function (){
					$group.hover(stop, start);
					delay();
				},
				fadeIn = function(){
					$items[currentItem].fadeIn(options["animation-time"], delay);
				}, 
				delay = function(){
					timeout = self.setTimeout(fadeOut, options["auto-nav-time"]);
				}, 
				fadeOut = function(){
					clearTimeout(timeout);
					$items[currentItem].fadeOut(options["animation-time"], next);
				}, 
				stop = function(){
					clearTimeout(timeout);
					reset();
				}, 
				start = function(){
					reset();
					timeout = self.setTimeout(fadeOut, options["auto-nav-time"]);
				}, 
				reset = function(){
					for (var n = 0; n < $items.length; n++) {
						if (currentItem != n) {
							$items[n].hide();
						}
						else {
							$items[n].show();
						}
					}
				}, 
				next = function(){
					if (currentItem < $items.length - 1) {
						setActiveNav(currentItem + 1);
						currentItem++;
					}
					else {
						setActiveNav(0);
						currentItem = 0;
					}
					
					fadeIn();
				};
				this.select = function(nItem){
					if (currentItem != nItem) {
						$items[currentItem].fadeOut(options["animation-time"], function(){
							setActiveNav(nItem);
							currentItem = nItem;
							$items[currentItem].fadeIn(options["animation-time"]);
						});
					}
				};
				init();
			};
			//End Nav Engine Objects
		};
		//End Navigation Objects
		
		init();
	}
	$(document).ready(init);
}();