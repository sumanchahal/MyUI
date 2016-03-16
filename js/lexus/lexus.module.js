
//(function ($) {
/**************
 * lexus.module object
 *
 * extends lexusUI, implements the different types of modules used on Explore, and other sections.
 *
 **************/
$.widget( "lexus.module", $.lexus.lexusUI, {
    // These options will be used as defaults
    options: {
        moduleState: 'off', // state of the module: 'off' or 'ready'(signifying all resources are loaded)
        moduleName: ''
    },

    // Set up the widget
    _create: function() {
    	var that = this;
    	
    	//this create function is bypassed because lexus.module is never called excplicity .module()
    	
        this._initModule();
 
    },

    _initModule: function() {
        var that = this;
        var event= 'scroll';
		//var loaders = [];
    //    if( this.element.is(":in-viewport") > 0 && this.options.moduleState === 'off') {
	//		$(this).children('img').each(function(){ $(this).trigger('init'); console.log('loading image');});
	//	}
	//			
	this.element.append('<div class="mask"><img src="/lexus-share/v2/img/Lexus_3DLogoRGB-white.png" class="loaderlogo"><div class="loader"><div class="bar"></div></div></div>');
	       
        if( this.options.moduleState === 'off' ) {
	    this.options.moduleState = 'ready';    
	  
	  // console.log (this);
       

      		$(window).on('viewportChange', function(e, state) {
	            var moduleInitCallback = eval('[that._init'+that.options.moduleName+']');
	       	    if ($.isFunction(moduleInitCallback[0])) {	 
	       	       moduleInitCallback[0].call(that);	 
                }		 
	       	    		  
	       	    var moduleStateCallback = eval('[that._init'+responsive.currentState+that.options.moduleName+']');     		 
			    if ($.isFunction(moduleStateCallback[0])) {	    	 
			        moduleStateCallback[0].call(that);   	    	 
			     }	          
			});
	              
			  var moduleResizeCallback = eval('[that._resizeCallback]');
              
              if ($.isFunction(moduleResizeCallback[0])) {
              $(window).on('resize.'+that.options.moduleName+'', function() {
                  moduleResizeCallback[0].call(that);   
              });	
              } 	 
	          
	        	         
	           
	         if( this.options.moduleState = 'ready' ) {
	         		          	
	         		 // console.log(that.options.moduleName+' done loading');
	         		  
	         		  this.element.find('img').not('.loaderlogo,.replay,.play-button').attr('src','/lexus-share/v2/img/transparent.gif');
	         		  if(this.element.find('img').length > 0){ 
	         		  this._loadImages(event);	
	         		  
	         		  if ($.browser.msie  && parseInt($.browser.version, 10) === 8) {
		              
		              	  this.element.find('.mask').fadeTo('slow', 0, function() { $(this).css('display','none') });
              
		              }
		              
	         		  }
	         		  else {
		         		  this.element.find('.mask').fadeTo('slow', 0, function() { $(this).css('display','none') }); 
		         		 
	         		  }
	         		  this.options.moduleState = 'loaded';

			 	var moduleInitCallback = eval('[that._init'+that.options.moduleName+']');
	  
	       	    if ($.isFunction(moduleInitCallback[0])) {
	       	       moduleInitCallback[0].call(that); 
	       	      
	       	     }		 		  
	       	     var moduleStateCallback = eval('[that._init'+responsive.currentState+that.options.moduleName+']');   		 
			     if ($.isFunction(moduleStateCallback[0])) {
			         moduleStateCallback[0].call(that);   	
			     }
	    

				  
	             		 
	         }	
	  }  
 
        //initialize video functionality
        if (that.element.find('.play-video').length > 0) {
            that.element.find('.play-video').unbind('click');
            that.element.find('.play-video').click(function(e) {
                e.preventDefault();
                that._playVideo($(this));
                $(window).bind("resize", function() {
                    that.element.parent().find('.videoplayer').css('height', that.element.parent().find('.fullwidth').height());
                });
                //                    $(window).trigger('resize');
            });

        }
        
         //handle outbound links
         this.element.find('.action').not('.action.drawer-btn').on('click',function(e) {
         
           // e.stopImmediatePropagation();

            if($('body').hasClass('co-model') && that.element.data('module-name') === 'Compare'){
	            fireTag('2532.2',{'<campaign>':campaign,'<module>': $.trim(that.element.data('module-name')),'<criteria>': $(this).parent('.row').prev('.row.compares').prev('.row.headline').children('h5').text(), '<action>': $(this).data('action')});
            }
            else if($('body').hasClass('co-model') && that.element.data('module-name') === 'Carousel'){
	            fireTag('2532.3',{'<campaign>':campaign,'<module>': $.trim(that.element.data('module-name')),'<action>': $(this).data('action')});
            }
            else if($('body').hasClass('co-model') && that.element.data('module-name') === 'Promo'){
	            fireTag('2532.4',{'<campaign>':campaign,'<promo_link>': $(this).data('action')});
            }
            else {
            	fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': $(this).data('action')});
            }

            location.href=$(this).data('href');
        });

       
        
        this.element.find('a[target="_blank"]').click(function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var tagID;
            
            var firetagtxt = ($(this).closest('li').find('h6').text()) ? $(this).closest('li').find('h6').text() : $(this).closest('li').find('h4').text();
           
           
           if( $('body').hasClass('performance') ){
             tagID = '2495.9';
             
              var firetagtxt = $(this).parent('li').children('h4').text();
  
	         fireTag(tagID,{
				'<link>':firetagtxt
			 });
			
           }
           else if ( $('body').hasClass('lfa') ){
	         tagID = '2497.11';
	         
	         fireTag(tagID,{'<video_title>':firetagtxt});
	             
           }
        
            if (!responsive.isiPad && !responsive.isiPhone && !responsive.isAndroid ) {
                var url = $(this).attr('href');
                window.open(url);
            } else {
                // prevent youtube video outlinks from going through stupid interstitial page
                var url = $(this).attr('href');
                if (url.indexOf('youtube') > 0 && url.indexOf('?url=') > 0) {
                    url = url.split('?url=');
                    window.open(url[1]);
                }
            }
        });
        
    },
  
     /**************
     * load module images
     **************/
    _loadImages: function(event) {
    var that = this;
    var eventName = event;
    var images = 0;
    var count = this.element.find('img').not('.loaderlogo').length;
    var loaderWidth = 10;
    var moduleName = that.element.data('module-name');
    var thisModule = this.element;
    var thresholdValue = 1000;
    var loader = that.element.find('.mask').children('.loader').children('.bar');
    var mask = that.element.find('.mask');
    var moduleViewableCallback = eval('[that._viewableCallback]');	
    var moduleFilmstripCallback = eval('[that._firstModuleAnimateTrigger]');
    var imgExclude;

	if (count === 0) {
			mask.fadeTo('slow', 0, function() { $(this).css('display','none') });
	}
	
	if (responsive.currentState === 'Desktop'){
		               imgExclude = '.loaderlogo';
		               thresholdValue = 1280;
	}
	else if (responsive.currentState === 'Mobile'){
		               imgExclude = '.loaderlogo,.film,.hotspot,ul.images .thumb,.bg.front,.bg.back'; //this prevents elements in Sliders from loading in Mobile, primarily for LFA, IS
		               thresholdValue = 720;
					   eventName = 'init'; // forces mobile images to load without scroll
	}    
		if( this.element.find('.film') ) { 
		ver = iOSversion(); 
    	if(isiPad && ver[0] <= 5) {
					  this.element.find('.film').remove(); //remove filmstrips from iOS 5 and below
		}
		
		}
    this.element.one('load',function(){
	    
	    $(this).find('img').not(''+imgExclude+'').each(function() {
	    	
		     var img = $(this).data('src');
		     try {
		     if(responsive.currentState === 'Desktop'){
		         img = img.replace('_mobile.jpg', '.jpg');
		     }
		     if(responsive.currentState === 'Mobile'){
		         img = img.replace('.jpg', '_mobile.jpg');
		         img = img.replace('_mobile_mobile.jpg', '_mobile.jpg'); // fixes mobile -> desktop -> mobile 
		     }
		     if (Modernizr.svg){} else { img = img.replace('.svg', '.png');}
		     $(this).data('src', img);
		     } catch(e) {}

	
	               
        	$(this).lazyload({
        	threshold : thresholdValue,  
        	effect : "show",
        	event : eventName,
            load : function()
            {
	          //  console.log(moduleName+' '+that.options.moduleName+' '+$(this).attr('src'));
	           var parent;
                images++;            
                loaderWidth = Math.round((images/count)*100);         
                loader.css('width',loaderWidth + "%");
				$(this).css('display','block');
               //if (loaderWidth < 100){
               if (loaderWidth > 100){
                mask.css({
	                opacity: 1,
	                display: 'block'
                });
                }
               	else {
	               	  mask.fadeTo('slow', 0, function() { $(this).css('display','none') });	
	               	  
	               	  
               	}
               	if (that.options.moduleName === 'Slider' || that.options.moduleName === 'LFASlider' || 
               	that.options.moduleName === 'TimelineSlider' || that.options.moduleName === 'Animation' ){

	               var parent =  $(this).closest('.viewport');
	               
	               if (responsive.currentState === 'Desktop'){
		               imgExclude = '.loaderlogo';
	               }
	               else if (responsive.currentState === 'Mobile'){
		               imgExclude = '.loaderlogo,.film,.hotspot,.thumb'; //this prevents elements in Sliders from loading in Mobile, primarily for LFA, IS
	               }

	               parent.find('img').not(''+imgExclude+'').each(function(){
	           
		               if($(this).attr('src') === '/lexus-share/v2/img/transparent.gif'){
		              
			               images++;  
			               setInterval(function(){
				           loaderWidth++;         
			               loader.css('width',loaderWidth + "%");
				               
			               }, 500);          
			               loaderWidth = Math.round((images/count)*100);         
			               loader.css('width',loaderWidth + "%");
			               $(this).lazyload({
						        	threshold : 10,  
						        	effect : "show",
						        	event : 'init',
						        	container: parent
						        	});
						     
						   }
					 				 
				   $(this).trigger('init'); 
				   
				   if($(this).attr('src') === '/lexus-share/v2/img/transparent.gif'){
				    //console.log($(this).data('src'));
				    img = $(this).data('src');
				    $(this).attr('src',img);
				   }

						     	
	               });
		           
		        }   
	

            }
            
            });     // end lazyload function   
            if(responsive.currentState === 'Mobile'){
         
				$(this).trigger('init');
		
		    }
			
        });
	    
    }).promise().done(function(){
					   	if(responsive.currentState === 'Desktop'){

					   	  $(this).one('inview', function (event, visible, visiblePartX, visiblePartY) {	
					   	     
					   	   	if (visible || visiblePartY == 'top') {
					   	   		
					   	  			  mask.fadeTo('slow', 0, function() { $(this).css('display','none') });
					   	  			  thisModule.find('.slide-nav,.play-button').fadeIn();          			 
					   	  		
					   	  		
					   	  		if ( thisModule.find('.filmstrip').length ) {																			
					   	   				
					   	   			moduleViewableCallback[0].call(that);
					   	
					   	   	    }
					   	   	
					   	   	
					   	   	} 
					   	  		        	  
					   	 });
					   	 
					   	 
					   	  if( thisModule.data('module-name') === 'Hero' || thisModule.data('module-name') === 'Compare'){
							  
							  setTimeout(function(){ // makes it work in ie8+

							  $('html, body').animate({scrollTop: $(window).scrollTop() + 2 }, 1000);
							  
							  }, 100)
							  
							  
						  }
						  if( thisModule.data('module-name') === 'Tachometer' || thisModule.data('module-name') === 'Dare to Unconform' || thisModule.data('module-name') === 'LFA Gauges'){
							  
			
							   if(isiPad){
			            		  ver = iOSversion();
									  if (ver[0] <= 5) {
										 thisModule.find('.film').remove();
										 thisModule.find('.description').show();
										 thisModule.find('.thumb,.video-button').fadeIn(400).addClass('active').css('z-index',50);  
										 thisModule.find('.description ul li:eq(0)').fadeIn(400).addClass('active').css('z-index',50);		
										 thisModule.find('li.filmstrip .play-video,.description ul li:eq(0) .play-audio,.replay,.arrow-nav,.slide-nav').delay(400).fadeIn(400).addClass('active').css('z-index',50);	 
										  
							    	  }
							    	  else{
							   			    moduleViewableCallback[0].call(that); 
							   		  }
							   	  }
							   	  else{
								   	   moduleViewableCallback[0].call(that);
							   	  }
						  }
						  
						  
					   	 
					   	}
					   else {
					   	      
					   mask.hide();

					   }   
					  


	});
	
	this.element.trigger('load');  // actually fires off the entire loader	
												
												
    },
     _switchImages: function(obj) {
    	var that = this;
        obj.find('img').each(function(){
	    var img = $(this).data('src');
		
		            try {
		            	if(responsive.currentState === 'Desktop'){
		                img = img.replace('_mobile.jpg', '.jpg');
		                }
		            	if(responsive.currentState === 'Mobile'){
		                img = img.replace('.jpg', '_mobile.jpg');
		                img = img.replace('_mobile_mobile.jpg', '_mobile.jpg'); // fixes mobile -> desktop -> mobile 
		                }
		                if (Modernizr.svg){} else { img = img.replace('.svg', '.png');}
		                $(this).attr('src', img);
		            } catch(e) {}
		      });

    },
    /**************
     * initialize desktop modules
     **************/
    _initDesktop: function() {
        var that = this;     
  
        $('.section').height('auto');
        $('.section-header .arrow').css('background','url(/lexus-share/v2/img/arrow-down.png)');


//        this.element.css('opacity',.01);
		
        if (that.element.find('.play-video').length > 0) {
            // if module was resized from mobile and has play-video
            this.element.find('.play-video').each(function () {
                if ($(this).closest('.wrapper').hasClass('video')) {
                    $(this).closest('.wrapper').removeClass('video').removeAttr('data-playerid').removeAttr('data-playerkey').removeAttr('data-videoplayer');
                    $(this).closest('.wrapper').children('img.play-button').remove();
                    $(this).closest('.wrapper').children('.fullwidth').children('img.play-button').remove();
                }
                $(this).show();
               // $(this).closest('.module').css('opacity','1');
            });

        }//end if statement
    },

    /**************
     * initialize mobile modules
     **************/
    _initMobile: function() {
        var that = this;

         if (isAndroid) {
            $('#model-section .wrapper').css('margin', 0);
        }
        


        //this.options.moduleState = 'mobile';
       // this.element.css('opacity',1);
       // this.element.unbind('inview');

        //$('#hero').css('margin-top', '52px' );

       			//console.log(moduleName, count, images)
			//console.log(that.options.moduleName+' done __loading');

        this.element.find('.wrapper').children('.copy').children('.play-video').eq(0).each(function () {

            if (Modernizr.svg){
                playButtonHTML = '<img src="/lexus-share/v2/img/play-button.svg" class="play-button">';
            } else {
                playButtonHTML = '<img src="/lexus-share/v2/img/play-button.png" class="play-button">';
            }

            $(this).hide();

            $(this).closest('.wrapper').addClass('video').attr('data-playerid', $(this).attr('data-playerid')).attr('data-playerkey',$(this).attr('data-playerkey')).attr('data-videoplayer',$(this).attr('data-videoplayer'));

            if($(this).parent('.copy').parent('.wrapper').find('div.fullwidth').length){

                $(this).parent('.copy').parent('.wrapper').children('.fullwidth').append(playButtonHTML);
                $(this).parent('.copy').parent('.wrapper').children('.fullwidth').children('.play-button').click(function(e) {
                    e.preventDefault();
                    var $video = $(this).parent('.fullwidth').parent('.wrapper');
                    that._playVideo($video);
                    $(window).bind("resize", function() {
                        that.element.parent().find('.videoplayer').css('height', that.element.parent().find('.fullwidth').height());
                    });
//                    $(window).trigger('resize');
                });
            }
            else if($(this).parent('.copy').parent('.wrapper').find('img.fullwidth').length){

                $(this).parent('.copy').parent('.wrapper').children('.copy').before(playButtonHTML);
                $(this).parent('.copy').parent('.wrapper').children('.play-button').click(function(e) {
                    e.preventDefault();
                    that._playVideo($(this).parent('.wrapper'));
                    $(window).bind("resize", function() {
                        that.element.parent().find('.videoplayer').css('height', that.element.parent().find('.fullwidth').height());
                    });
//                    $(window).trigger('resize');
                });
            }
        });


// execute module callback hook if there is one.
  //      if (this.options.moduleName) {
  //          var moduleStateCallback = eval('[that._init'+responsive.currentState+that.options.moduleName+']');
  //          if ($.isFunction(moduleStateCallback[0])) moduleStateCallback[0].call(that);
  //      }

    },



    _playVideo: function(obj) {
        var vidParams = {
                'bgcolor': '#f0f0f0',
                'width': '100%',
                'height': '100%',
                'playerID': brightcovePlayerID,
                'playerKey': 'AQ~~,AAABhuSnaLE~,1jgLZQvAmMbWgCeYEEbAmCDWMos9zxDb',
                'includeAPI': 'true',
                'templateReadyHandler': 'onTemplateLoaded',
                'isVid': 'true',
                'isUI': 'true',
                'dynamicStreaming': 'false',
                'autoStart': 'true',
                'wmode': 'transparent',
                '@videoPlayer': '1750437673001',
                'linkBaseURL': location.href.match('http://.[^/]+/')[0]+'models/ES/gallery/videos/'
            },
            viewport = obj.closest('.viewport'),
            that = this;

        if(!$('body').hasClass('performance')){ // needs a refactor of all CTAs

            fireTag(this.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': that.element.closest('.module').data('module-name'), '<action>': 'Play Video'});

        }

        if (!responsive.isiPhone && !responsive.isiPod && !responsive.isAndroid) {

            this._removeVideo();

            obj.find('.play-button').hide();

            var vidHTML = '<div class="vidBG"></div><div class="videoplayer"><a href="#" class="close">×</a></div>';

            viewport.append(vidHTML);

            viewport.find('a.close').click(function(e) {
                e.preventDefault();
                obj.find('.play-button').show();
                that._removeVideo("#video"+viewport.parent('.module').index('.module'));
                viewport.find('.wrapper').show();

                //TODO: this should be integrated into the slider module class
                viewport.find('li.video img').css('opacity', 1);
            });

        }

        $(document).data('lexusUI').playVideo($('.videoplayer'), {
            '@videoPlayer': obj.data('videoplayer')
        });



        return true;
    },

    _removeVideo: function() {
        $('.videoplayer, .vidBG').remove();
    },

// Use the destroy method to clean up any modifications your widget has made to the DOM
    destroy: function() {
// In jQuery UI 1.8, you must invoke the destroy method from the base widget
        $.Widget.prototype.destroy.call( this );
// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
    }
});

/**************
 * lexus.Static object
 **************/

$.widget('lexus.Static', $.lexus.module, {
    _create: function() {
        var that = this;
        this.options.moduleName = this.widgetName;
        $.lexus.module.prototype._initModule.call(this);
    },

    _initStatic: function() {
        var that = this;
        // Init counter
        this._initCounter();
        
        
    },
    _initDesktopStatic: function() {
        var that = this;
        that._switchImages(this.element);
        $.lexus.module.prototype._initDesktop.call(this);
        this.element.find('.copy').children('li').css('width','');
        this.element.find('.copy').children('ul.cols').children('li').css('width','');
        this.element.find('.copy.col2').children('li').css('width',468+'px');
        this.element.find('.copy.col3').children('li').css('width',304+'px');
        this.element.find('.copy.col4').children('li').css('width',222+'px');
        /* THIS IS A TEMPORARY SOLUTION FOR IS OVERVIEW PAGE LINKS */    
	   if( $('body').is('.is-model') && $('body').is('.overview') ) {
	
		$('.module.features').find('li.models').each(function(index) {			
				var explore_href = '';

				   if(index == "4") {
				    $(this).find('.top, .top h3').children('a').attr('href','#').on('click',function(ev){ev.preventDefault(); return;});	
					$(this).find('.statscta').each(function(index){
				
					if(index == "0") {				
						var item = $(this).children('a');		
						explore_href = 'http://lexus.com/models/ISF/';
						item.attr('href', explore_href);					
					}

					if(index == "1") {				
						var item = $(this).children('a');	
						explore_href = 'http://lexus.com/models/ISC/';
						item.attr('href', explore_href);					
					}
									
					});
				
				}		
		});



  }
  
  		if( $('body').is('.isf-model') && $('body').is('.overview') ) {	
			//Needed to modify these two links to be able to go out to another model page
			$('.promos.module .copy.col3 li.promo:last-child, .action').last().attr('data-href', '/models/IS/');
			$('.promos.module .copy.col3 li.promo:last-child .action span a').last().attr('href', '/models/IS/');
			}
			
			

		if( $('body').is('.isc-model') && $('body').is('.overview') ) {	
			//Needed to modify these two links to be able to go out to another model page
			$('.promos.module .copy.col3 li.promo:last-child, .action').last().attr('data-href', '/models/IS/');
			$('.promos.module .copy.col3 li.promo:last-child .action span a').last().attr('href', '/models/IS/');
			}
		
			
			if( $('body').is('.is-model') && $('body').is('.explore') ) {	
			$('.fperformance.module div.action span a')
			.one()
			.attr({
				href:'/outlink/index.html?url=http://viewer.zmags.com/publication/70e860a2',
				target:"_blank"
			})
			.on('click',function(ev){
				fireTag($(this).closest('.module').data('firetag')
				,{'<model_name>':$('body').data('modelname')
				,'<module>': $(this).closest('.module').data('module-name')
				, '<action>': 'View Features'
			});
			ev.stopImmediatePropagation()});
		}
    },

    _initMobileStatic: function(){
        var that = this;
        that._switchImages(this.element);
        $.lexus.module.prototype._initMobile.call(this);
        this.element.find('.copy').children('li').css('width',$(window).width()-40);
        
       if (!this.element.hasClass('rearseat') || !$('body').hasClass('overview')) {
           this.element.find('.copy li').not('.promo').children('h5').each(function() {
            $(this).wrap('<span />');
            var $span = $(this).parent('span');
            var $img = $span.prev('img.full');
            $img.detach().insertAfter($span);
            $span.parent('li').on('click',function(){
                $(this).children('p,img.full,.action').toggleClass('active');
                $(this).children('a').children('img.full').toggleClass('active');
                $(this).children('span').children('h5').toggleClass('active');

                if ( $(this).children('p').hasClass('active') ){
                    fireTag($(this).closest('.module').data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $(this).closest('.module').data('module-name'), '<action>': 'Expand'});
                }

            });


        });
        
        }

	 	/* THIS IS A TEMPORARY SOLUTION FOR IS OVERVIEW PAGE LINKS */    
	   if( $('body').is('.is-model') && $('body').is('.overview') ) {
	
		$('.module.features').find('li.models').each(function(index) {			
				var explore_href = '';

				   if(index == "4") {
				    $(this).find('.top, .top h3').children('a').attr('href','#').on('click',function(ev){ev.preventDefault(); return;});
					$(this).find('.statscta').each(function(index){
				
					if(index == "0") {				
						var item = $(this).children('a');		
						explore_href = '/models/ISF/';
						item.attr('href', explore_href);					
					}
					if(index == "1") {				
						var item = $(this).children('a');	
						explore_href = '/models/ISF/index.jsp';
						item.attr('href', explore_href);					
					}

					});				
				}
		  
		});
		

	}
	
		  	if( $('body').is('.isf-model') && $('body').is('.overview') ) {	
			//Needed to modify these two links to be able to go out to another model page
			$('.promos.module .copy.col3 li.promo:last-child, .action').last().attr('data-href', '/models/IS/');
			$('.promos.module .copy.col3 li.promo:last-child .action span a').last().attr('href', '/models/IS/');
			}
		
		if( $('body').is('.isc-model') && $('body').is('.overview') ) {	
			//Needed to modify these two links to be able to go out to another model page
			$('.promos.module .copy.col3 li.promo:last-child, .action').last().attr('data-href', '/models/IS/');
			$('.promos.module .copy.col3 li.promo:last-child .action span a').last().attr('href', '/models/IS/');
			}
			
			if( $('body').is('.is-model') && $('body').is('.explore') ) {	
			$('.fperformance.module div.action span a')
			.first()
			.attr({
				href:'/outlink/index.html?url=http://viewer.zmags.com/publication/70e860a2',
				target:"_blank"
			})
			.on('click',function(ev){
				fireTag($(this).closest('.module').data('firetag')
				,{'<model_name>':$('body').data('modelname')
				,'<module>': $(this).closest('.module').data('module-name')
				, '<action>': 'View Features'
			});
			ev.stopImmediatePropagation()});
		};
    
    },

    _resizeCallback: function() {
        var that = this;
        if (responsive.currentState === 'Mobile'){
            this.element.find('.copy').children('li').css('width',$(window).width()-40);
        }
        if (responsive.currentState === 'Desktop'){

        }
    },

    // Initialized Counter UI
    // o Object options/config
    // o.$element DOM Object the element to be initialized
    _initCounter: function() {
        var _this = this;

        $('.counter', this.element).each(function(){
            var o = {};

            o.$this = $(this);

            // Only continue if the element is supposed to animate
            if (!o.$this.hasClass('is-animate')) {
                return true;
            }

            // Get counter value
            o.counterTotal = o.$this.data('total');

            // Get counter offset value
            o.counterTotalOffset = (o.$this.data('totalOffset')) ? o.$this.data('totalOffset') : 0;


            // Animation duration (total)
            if (o.counterTotalOffset > 0) {
                o.itemDuration = 3000 / o.counterTotalOffset;
            } else {
                o.itemDuration = 3000 / o.counterTotal;
            }

            // set total items
            // This is used to calc how many items are actually going to be animated
            // Default is 0, which will output all items
            if (o.counterTotalOffset > 0) {
                o.totalItems = o.counterTotalOffset;
            } else {
                o.totalItems = o.counterTotal;
            }

            // the best opportunity to get height
            // o.height = o.$this.outerHeight(true);
            o.height = 82;

            // exit if counterTotal is malformed
            switch ($.isNumeric(o.counterTotal)) {
                case !true:
                    return false;
                    break;
            }

            _this._counterGenerateItems(o);

            _this._counterBindAnimate(o);
        });
    },

    // Gives container dimension
    _counterSetDimensions: function(o){
        // lock container dimensions
        o.$this.css({
            height: o.height,
            width: $('.counter-container',o.$this).outerWidth(true)
        });
    },

    // generate counter items
    _counterGenerateItems: function(o){
        var html,
            cssClass,
            items_str = '';

        var items = [];

        o.range,
            o.start = 0;

        if (o.counterTotalOffset === 0) {
            o.range = o.totalItems;
            o.start = 0;
        } else {
            o.range = o.counterTotalOffset;
            o.start = o.counterTotal - o.counterTotalOffset;
        }

        // open the wrapper
        html = '<span class="counter-container"><span>';

        for (i = 0; i < o.range+1; i++) {
            items.push(i+o.start);
        };

        items_str = items.toString();

        html += items_str.replace(/,/g,"</span><span>");

        // close the wrapper
        html += '</span></span>';

        // write html
        o.$this.html(html);
    },

    // animate counter items
    _counterAnimateItems: function(o){
        var _this = this;
        var duration = Math.floor(o.totalItems * o.itemDuration);

        // calc total item height (will be used to animate)
        var totalItemHeight = o.totalItems * o.height;

        // the best place to set dimension - right before animation!
        _this._counterSetDimensions(o);

        var style_rules = {
            top: -totalItemHeight
        }

        switch (Modernizr.csstransitions) {
            case true:
                $('.counter-container', o.$this)
                    .css(style_rules);
                break;
            default:
                $('.counter-container', o.$this)
                    .animate(style_rules, duration);
                break;
        }

    },

    _counterResetItems: function(o){
        switch (Modernizr.csstransitions) {
            case true:
                $('.counter-container', o.$this)
                    .removeAttr('style');
                break;
            default:
                $('.counter-container', o.$this)
                    .stop(true,true)
                    .css({top:'0px'});
                break;
        }
    },

    _counterBindAnimate: function(o){
        var _this = this;
       o.$this.on('inview', function(ev, visible){
            switch (visible) {
                case true:
                    _this._counterAnimateItems(o);
                    break;
                default:
                    _this._counterResetItems(o);
                    break;
            }
        });
        
       /* if( o.$this.element.is(":in-viewport") > 0 ) {
        	_this._counterAnimateItems(o);
        }
*/
    }

});

/**************
 * lexus.slider object
 * - image slider w/ video option
 **************/

$.widget('lexus.Slider', $.lexus.module, {
    _create: function() {
        var that = this;
        this.options.slideWidth = 0;
        this.options.slideNumber = 0;
        this.options.currentIndex = 0;
        this.options.slideDuration = 800;
        this.options.slideNavOff = '';
        this.options.slideNavOn = '';
        this.options.firetagFired = false; //used to fire firetag for arrow vs dot nav
        this.options.moduleName = this.widgetName;
		this.options.prevIndex = 0;
        this._initModule();
      
    },

    _initSlider: function() {
        var that = this;
  
// slide nav dots are defined in the HTML. we grab them here
        this.options.slideNavOn = this.element.find('.slide-nav li img').eq(0).data('src');
        this.options.slideNavOff = this.element.find('.slide-nav li img').eq(1).data('src');
        this.options.slideWidth = 1280; //this.element.find('.wrapper').width();
        var slideul = this.element.find('ul.images');
        var slideli = this.element.find('ul.images li');
        var navli = this.element.find('.slide-nav li');

// clear slide nav dots before re-populating
        this.element.find('.slide-nav ul').html('');
        this.element.find('.arrow-nav').show();
        this.element.find('.slide-nav').hide();
//find description lis and hide them, two methods (one for iE8 and CSS3 for other browsers)


        this.element.find('ul.images li.video').append('<img src="/lexus-share/v2/img/play-button.png" data-src="/lexus-share/v2/img/play-button.svg" class="play-button">');

        if (this.element.find('ul.images li').length > 1 ) {
            //build out carousel nav dots
            $.each(this.element.find('ul.images li'), function (i) {
                var img = (i == 0) ? that.options.slideNavOn : that.options.slideNavOff;

                that.element.find('.slide-nav ul').append('<li><img data-src="' + img + '" src="' + img + '"/></li>');
                that.options.slideNumber+=1;
            });

            this.element.find('.slide-nav').css('width', ((this.element.find('ul.images li').length) * 23));

            //this.element.find('.arrow-nav').fadeIn();
            this.element.find('.slide-nav').show();
            this.element.find('.arrow-nav li.right').fadeIn();
            // attach click functions to UI
            this.element.find('.slide-nav li').click(function (){

                if( that.element.find('.wrapper').is(':animated') ) return true;

                that._moveSlides($(this));
                if (that.options.firetagFired == false) {
                    fireDot();
                }
                function fireDot(){
                	if($('body').hasClass('co-model')){
	                	fireTag(that.element.data('firetag'),{'<campaign>':campaign,'<module>':$.trim(that.element.data('module-name')),'<action>': 'Carousel'});
                	}
                	else{
                    fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<section>':sectionName,'<module>': $.trim(that.element.data('module-name')), '<action>': 'Carousel'});
                    }
                }

            });
            this.element.find('.arrow-nav li.right').on('click',function() {
                if( that.element.find('.wrapper').is(':animated') ) return true;
                that.options.currentIndex++;
                that.options.firetagFired = true;
                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                setTimeout(function(){that.options.firetagFired=false;}, 50);

                fireRight();
                function fireRight(){
                	if($('body').hasClass('co-model')){
	                	fireTag(that.element.data('firetag'),{'<campaign>':campaign,'<module>':$.trim(that.element.data('module-name')), '<action>': 'Right Toggle'});
                	}
                	else{
                    fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<section>':sectionName,'<module>': $.trim(that.element.data('module-name')), '<action>': 'Right Toggle'});
                    }
                }

            }).show();

            this.element.find('.arrow-nav li.left').on('click',function() {
                if( that.element.find('.wrapper').is(':animated') ) return true;
                that.options.currentIndex--;
                that.options.firetagFired = true;
                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                setTimeout(function(){that.options.firetagFired=false;}, 50);

                fireLeft();
                function fireLeft(){
                	if($('body').hasClass('co-model')){
	                	fireTag(that.element.data('firetag'),{'<campaign>':campaign,'<module>':$.trim(that.element.data('module-name')), '<action>': 'Left Toggle'});
                	}
                	else{
                    fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<section>':sectionName,'<module>':$.trim(that.element.data('module-name')), '<action>': 'Left Toggle'});
                    }
                }
            }).hide();

            this.element.find('.wrapper,.description').swipe({
                swipeStatus:function(event, phase, direction, distance, fingerCount) {

                    var threshold = 5;
                    var slide = that.options.currentIndex*slideli.width();

                    if (phase=="move" && distance<=threshold) {

                        if(direction == "left") {

                            slide = slide+distance;
                            that.element.find('.wrapper').scrollLeft(slide);
                            //console.log("left "+ slide);
                        }
                        if(direction == "right") {
                            slide = slide-distance;
                            that.element.find('.wrapper').scrollLeft(slide);
                            // console.log("right "+ slide);
                        }

                    }
                    else if (phase=="move" && distance>threshold) {
                        if( that.element.find('.wrapper').is(':animated') ) return true;
                        if(direction == "left") {
                            //  console.log("sliding right");
                            that.options.currentIndex++;
                            if (that.options.currentIndex<(that.options.slideNumber-1)) {
                                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                            }
                            else {
                                that.options.currentIndex=that.options.slideNumber-1;
                                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                            }
                            return false;
                        }
                        if(direction == "right") {
                            //  console.log("sliding left");
                            if (that.options.currentIndex > 0) {
                                that.options.currentIndex--;
                                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                            }

                            return false;
                        }
                    }
                    else if (phase=="end" && distance<threshold) {
                        slide = that.options.currentIndex*slideli.width();

                        that.element.find('.wrapper').animate({
                            scrollLeft : +slide
                        }, 500, 'easeOutQuad');
                        return false;

                    }

                },
                threshold:60,
                allowPageScroll:$.fn.swipe.pageScroll.VERTICAL


            });

        }   //end if statement for more than one slide
        else if (this.element.find('ul.images li').length <= 1 ) { // Check to see if theres more than 1 slide
            this.element.find('.arrow-nav').hide();
            this.element.find('.slide-nav').hide();
        }

        if (this.element.find('ul.images li').hasClass('video')) { // Check to see if there's video
            this.element.find('ul.images li.video .play-button').on('click',function() {
                that._playVideo($(this).parent());
            });
        }

       
    },

    _moveSlides: function(obj) {
        var that = this,
            thisSlide = 0;

        // alert('_moveSlides')
        this.options.currentIndex = obj.index();

		if( this.options.currentIndex != this.options.prevIndex ) {


        if (responsive.currentState === 'Mobile'){
            thisSlide=(this.options.currentIndex * $(window).width());
        }
        else if (responsive.currentState === 'Desktop'){
            thisSlide=(this.options.currentIndex * 1280);
        }

        if (Modernizr.csstransitions === true) {
            this.element.find('.description ul li').addClass('off').removeClass('active').css('z-index',0);
        } else {
            this.element.find('.description ul li').hide().removeClass('active').css('z-index',0);
        }
        
        this.element.find('.wrapper').animate({
            scrollLeft : +thisSlide
        }, 500, 'easeOutQuad');
        // alert(thisSlide);
        if (Modernizr.csstransitions === true) {
            this.element.find('.description ul li:eq('+this.options.currentIndex+')').removeClass('off').addClass('active').css('z-index',50);
        } else {
            this.element.find('.description ul li:eq('+this.options.currentIndex+')').show().addClass('active').css('z-index',50);
        }


        obj.parent('ul').find('img').attr('src', that.options.slideNavOff);
        obj.find('img').attr('src', that.options.slideNavOn);

        if (responsive.currentState === 'Desktop'){

            if ( this.element.find('ul.images li:eq('+this.options.currentIndex+')').find('.animation').length ) {
                var $currSlide = that.element.find('ul.images li:eq('+this.options.currentIndex+')');
                $currSlide.find('.animation img').each(function(i) {
                    var thisImg = $(this);
                    thisImg.css('z-index', 0);
                });
                $currSlide.find('.animation img:eq(0)').css('z-index', 300);
                setTimeout(function() {
                    that._animateSlide($currSlide);
                }, this.options.slideDuration );
            } // end animation

//          Check to see if slider is at either end of the index and hide or show arrows based on index position
            var arrowNav = this.element.find('.arrow-nav');
            if (obj.index() == that.options.slideNumber-1) {
                arrowNav.find('li.right').fadeOut();
            } else { arrowNav.find('li.right').fadeIn(); }
            if (obj.index() == 0) {
                arrowNav.find('li.left').fadeOut();
            } else { arrowNav.find('li.left').fadeIn(); }
        }
//        console.log(this.options.currentIndex);
        //this.options.firetagFired = false;

        this.options.prevIndex = this.options.currentIndex;
        return this.options.currentIndex;
        }


    },
    _initDesktopSlider: function() {

        var that = this;
        that._switchImages(this.element);
        this.options.slideWidth = 1280;
        var theHeight = 200;
        this.element.find('ul.images').css('width', (this.element.find('ul.images li').length * this.options.slideWidth));
        
        //console.log('slider' + theHeight);
        this.element.find('.description').height(200);
        
     
        if (Modernizr.csstransitions === true) {
            this.element.find('.description ul li').not('eq(0)').removeClass('active').addClass('off').css('z-index',0);
            this.element.find('.description ul li:eq(0)').removeClass('off').addClass('active').css('z-index',50);
            
        } else {
            this.element.find('.description ul li').not('eq(0)').fadeOut(500).css('z-index',0);
            this.element.find('.description ul li:eq(0)').fadeIn(500).css('z-index',50).addClass('active');
        }
         

          if (!Modernizr.csstransitions) {
            this.element.find('.description ul li').not('eq(0)').hide();
            this.element.find('.description ul li:eq(0)').show().css('z-index',50);
        }
        else {
            this.element.find('.description ul li').not('eq(0)').removeClass('active').addClass('off');
            this.element.find('.description ul li:eq(0)').removeClass('off').addClass('active').css('z-index',50);
        }


        if ( this.element.find('.animation').length ) {
          
          				var moduleStateCallback = eval('[that._viewableCallback]');
								              	
													 
						this.element.bind('inview', function(event, isInView, visiblePartX, visiblePartY) {
			            		if (isInView) {
			            		 // element is now visible in the viewport
			            		 if (visiblePartY == 'top') {
			            		 
				            		if( $("html").hasClass("ie8") ) { 
				            		 moduleStateCallback[0].call(that);
				            		}
			            		  // top part of element is visible
			            		  //console.log('Can see the top.');
			            		 } else if (visiblePartY == 'bottom') {
			            		  // bottom part of element is visible
			            		  //console.log('Can see the bottom.');
			            		 } else {
			            		  // whole part of element is visible
			            		     moduleStateCallback[0].call(that);
			            		 }
			            		} else {
			            		 // element has gone out of viewport
			            		}
			            	});
			            	

          								
												
        } // end if animation
         
						           		
    },
    _viewableCallback: function() {
    		var that = this;
            window.legacyContext = this;
    		
	     	var $currSlide = that.element.find('ul.images li.crop-animate');
            var replayBtn = '<img src="/lexus-share/v2/img/replay.png" class="replay">';

            $currSlide.append(replayBtn);
            $currSlide.find('.animation img').css('z-index', 0);
            $currSlide.find('.animation img:eq(0)').css('z-index', 300);

            $currSlide.find('.replay').on('click',function() {
                $(this).parent('.crop-animate').trigger('click');
                $(this).trigger("fire");
                
            });
            
             $currSlide.find('.replay').one("fire", function(){
				  fireTag(2471.2,{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'Refresh'});
		     });


            $currSlide.on('click',function() {
                if( that.element.find('ul.images').is(':animated') ) return true;
                $currSlide.find('.animation').children('img').not(':eq(0)').css('z-index', 0);
                $currSlide.find('.animation').children('img:eq(0)').css('z-index', 300);
                that._animateSlide($(this));
                
            });


            $currSlide.trigger('click');
            
        
 
    },
   
    _initMobileSlider: function() {
        var that = this;
        that._switchImages(this.element);
        var ulWidth,ulPlace = 0;
        var max = 0;

        this.options.slideWidth = $(window).width();
		this.element.find('.description ul li').css('height','auto');
        ulWidth = this.element.find('ul.images li').length * this.options.slideWidth;
        ulPlace = this.options.slideWidth * this.options.currentIndex;
        this.element.find('ul.images').css('width', ulWidth);
        this.element.find('ul.images li, ul.images li img').not('.replay').css('width', this.options.slideWidth);
        //this.element.find('ul.images').css('left', 0).css('-webkit-transform', 'translate3d('+0+',0,0)');
        //this.element.find('.slide-nav').find('img').attr('src', this.options.slideNavOff);
        //this.element.find('.slide-nav').find('img').eq(0).attr('src', this.options.slideNavOn);


        this.element.find('.description ul li').each(function(){
            var h = $(this).height();
            if(h > max)
                max = h;
        });
        
       	    this.element.find('.description').height(max);
       // this.element.find('.copy').height(max);
       // this.element.find('.description ul li').height(max);

        if (!Modernizr.csstransitions) {
            this.element.find('.description ul li').not('eq(0)').hide();
            this.element.find('.description ul li:eq(0)').show().css('z-index',50);
        }
        else {
            this.element.find('.description ul li').not('eq(0)').removeClass('active').addClass('off');
            this.element.find('.description ul li:eq(0)').removeClass('off').addClass('active').css('z-index',50);
        }

        this.element.find('.play-button').attr('src', this.element.find('.play-button').data('src'));


    },


// need to dynamically resize slides for responsive viewport
    _resizeCallback: function() {
        var ulWidth,ulPlace = 0;
        var max = 0;
        //resize video
        this.element.parent().find('.videoplayer').css('height', this.element.parent().find('.video').height());


        if (responsive.currentState == 'Mobile')
        {
            this.options.slideWidth = $(window).width();
            ulWidth = this.element.find('ul.images li').length * this.options.slideWidth;
            this.element.find('ul.images').css('width', ulWidth);
            this.element.find('ul.images li').css('width', this.options.slideWidth);
            this.element.find('ul.images li img').not('.replay,.bottom').css('width', this.options.slideWidth);
            this.element.find('.description').height(200);
            this.options.currentIndex = 0;
            this.element.find('.wrapper').scrollLeft(0);

        }
        if (responsive.currentState == 'Desktop')
        {

            $('.animation').closest('.viewport').find('.replay').css('left', $('.viewport').width()-30);
            $('.crop-animate .replay').css('left', ($('.viewport').width() + ((1280-$('.viewport').width())/2))-30);

            this.options.slideWidth = 1280;
            ulWidth = this.element.find('ul.images li').length * this.options.slideWidth;
            this.element.find('ul.images').css('width', ulWidth);
            this.element.find('ul.images li').css('width', this.options.slideWidth);
            this.element.find('ul.images li img').not('.replay').css('width', 'auto');

            this.element.find('.description').height(200);

            //this.element.closest('.module').css('opacity','1');
        }

    },

    _animateSlide: function(obj) {
        var that = this;
        setTimeout(function() {
            obj.find('.animation img').each(function(i) {
                var thisImg = $(this);
                setTimeout(function() {
                    thisImg.css('z-index', 300);
                }, i*200);
            });
        }, 300);
      
    }


});


/**************
 * lexus.Hotspot object
 * - sub-classed from module object
 **************/

$.widget('lexus.Hotspot', $.lexus.module, {
    _create: function() {
        this.options.moduleName = this.widgetName;
        this.options.slideWidth = 0;
        this.options.slideNavOff = '';
        this.options.slideNavOn = '';
        this.options.duration = 300;
        this.options.firetagFired = true;
        this._initModule();

    },
    _initHotspot:function(){
	    // must be here for lazyloading
    },
    _initDesktopHotspot: function() {
        var that = this;
        that._switchImages(this.element);
        that.element.find('.hotspot-content h5').each(function(){ $(this).replaceWith('<h3>' + this.innerHTML + '</h3>'); });
        that.element.find('.hotspot-content').hide();
        that.element.find('.start').show();
        if (that.element.find('img.back').length) {
            that.element.find('.viewport').find('img.front').css('opacity', '1');
            that.element.find('.viewport').find('img.back').css('opacity', '1');
        }

        that.element.find('img.hotspot').on('click', function(){
  
            if( that.element.find('.viewport').find('img.front').is(':animated') ) return true;
            that._hotImage($(this));
        }); //bind the mouseenter event

        that.element.find('img.hotspot').eq(0).trigger('click');

        // setup firetag for View Specs on CT
        if ($('body.cth').length) {
            that.element.find('.hotspot-content .action a').click(function() {
                fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'View Specs'});
            });
        }
        //callback here
        
    }, // end initDesktop

    _initMobileHotspot: function() {
        var that = this;
        that._switchImages(this.element);
        that.element.find('.copy').children('li').css('width',$(window).width()-40);

        that.element.find('.hotspot-content h3').each(function(){
            $(this).replaceWith('<h5>' + this.innerHTML + '</h5>');
        });

        that.element.find('li h5').each(function() {
            $(this).wrap('<span />');
            var $span = $(this).parent('span');
            var $img = $span.prev('img');
            $img.detach().insertAfter($span);
            $span.parent('li').on('click',function(){
                $(this).children('p,img.full,.action').toggleClass('active');
                $(this).children('span').children('h5').toggleClass('active');

                if ( $(this).children('p').hasClass('active') ) {
                    fireTag($(this).closest('.module').data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $(this).closest('.module').data('module-name'), '<action>': 'Expand'});
                }

            });


        });

        that.element.find('.hotspot-content').show();
        that.element.find('.start').show();



    },
     _resizeCallback: function() {
        var that = this;
        if (responsive.currentState === 'Mobile'){
            this.element.find('.copy').children('li').css('width',$(window).width()-40);
        }
        if (responsive.currentState === 'Desktop'){

        }
    },

    _hotImage: function(obj) {
        var that = this;
        //$(this).parents('.viewport').find('img.hotspot').unbind('mouseover', hotImage);
        var clicked = obj.attr('id'); // save the id of the clicked hotspot, formats the image name
        /* if the module needs to transition between 2 or more images,
         place two fullwidth bgs in it with .front and .back classes */
        if (that.element.find('img.back').length) {

            that.element.find('.viewport').find('img.back').attr('src', '/lexus-share/v2/img/models/'+modelCode+'/explore/hotspots/'+clicked+'-hotspot.jpg');
            that.element.find('.viewport').find('img.front').animate({ opacity: 0 }, this.options.duration, 'easeOutQuad', function() {
                $('.front,.back').toggleClass('front back').css('opacity','1');
            });
        }

        else {
            /* if the module doesn't need to transition,
             just use a fullwidth bg and this will change it for you */
            that.element.find('.viewport').find('img.bg').css('opacity','1');
            that.element.find('.viewport').find('img.bg').attr('src', '/lexus-share/v2/img/models/'+modelCode+'/explore/hotspots/'+clicked+'-hotspot.jpg');
        }
        /* show and hide copy if its in the module */
        if (that.element.hasClass('clrhotspot')) {
            that.element.find('.hotspot-content, .start').hide();
            that.element.find('.'+clicked+'.hotspot-content').show();
        }


        that.element.find('.copy').show();

        if (this.options.firetagFired == false) {
            fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'Expand'});
        }
        this.options.firetagFired = false;
    } // end hotImage

}); // end hotSpot

/**************
 * lexus.Drawer object
 * - sub-classed from module object
 **************/

$.widget('lexus.Drawer', $.lexus.module, {
    _create: function() {
        this.options.moduleName = this.widgetName;
        this.options.innerStr = "";

	     this._initModule();
    },

    _initDesktopDrawer: function() {
        var that = this;
        that._switchImages(this.element);
        this.element.find('.copy').children('li').css('width','');
        this.element.find('.copy').children('ul.cols').children('li').css('width','');
        this.element.find('.copy.col2').children('li').css('width',468+'px');
        this.element.find('.copy.col3').children('li').css('width',304+'px');
        this.element.find('.copy.col4').children('li').css('width',222+'px');
        that.element.find('.drawer-btn').addClass('open');
        this.options.innerStr  = that.element.find('.drawer-btn').text();

//        that._closeDrawer($(this), this.options.innerStr);

        that.element.find('.drawer-btn').on('click', function() {
            //alert($(this).text());
            that._openDrawer($(this));
        });
        
    }, // end initDesktop

    _initMobileDrawer: function() {
        var that = this;
		 that._switchImages(this.element);
		 
	 if (!this.element.hasClass('rearseat') || !$('body').hasClass('overview')) {
           this.element.find('.copy li').children('h5').each(function() {
            $(this).wrap('<span />');
            var $span = $(this).parent('span');
            var $img = $span.prev('img.full');
            $img.detach().insertAfter($span);
            $span.parent('li').on('click',function(){
                $(this).children('p,img.full,.action').toggleClass('active');
                $(this).children('span').children('h5').toggleClass('active');

                if ( $(this).children('p').hasClass('active') ) {
                    fireTag($(this).closest('.module').data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $(this).closest('.module').data('module-name'), '<action>': 'Expand'});
                }

            });


        });
      }  
        
    },

    _initDrawer: function() {
        var that = this;
    },

    _openDrawer: function(obj) {
        var that = this;
        var innerStr =  obj.children('span').text();
        var h = that.element.find('.bg').height();
        var dh = that.element.find('.drawer-content').height();
        var bottomPadding = 0;

        obj.off('click');
        obj.addClass('closed');
        obj.removeClass('open');
        obj.children('span').text('Close');

        that.element.animate({height:h+dh+bottomPadding}, 300);

        fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>':$.trim(that.element.data('module-name')), '<action>': 'Learn More'});

        obj.on('click', function(){
            that._closeDrawer($(this),innerStr);
        });
    },

    _closeDrawer: function(obj,str) {
        var that = this;
        var h = that.element.find('.bg').height();
        var dh = that.element.find('.drawer-content').height();
        var bottomPadding = -54;

        obj.off('click');
        obj.addClass('open');
        obj.removeClass('closed');
        obj.children('span').text(str);

        that.element.animate({height:h}, 300);

        obj.on('click', function(){
            that._openDrawer($(this));
        });
    }

}); // end Drawer

/**************
 * lexus.Animation object
 * - sub-classed from module object
 **************/

$.widget('lexus.Animation', $.lexus.module, {
    _create: function() {
        this.options.moduleName = this.widgetName;
        this._initModule();
    },
    _initAnimation: function(){
	    
    },
    _initDesktopAnimation: function() {

        var that = this;
		 that._switchImages(this.element);
        // Abort init if only 1 animation img/frame
        if (this.element.find('.animation').children('img').length <= 1) {
            return false;
        }
        this.element.find('.animation').closest('.viewport').append('<img src="/lexus-share/v2/img/replay.png" class="replay">');
        this.element.find('.animation').children('img').not(':eq(0)').css('z-index', 0);
        this.element.find('.animation').children('img:eq(0)').css('z-index', 300);


        				var moduleStateCallback = eval('[that._viewableCallback]');
									              	
													 
						this.element.bind('inview', function(event, isInView, visiblePartX, visiblePartY) {
			            		if (isInView) {
			            		 // element is now visible in the viewport
			            		 if (visiblePartY == 'top') {
			            		 
			            		 	 if( $("html").hasClass("ie8") ) { 
				            			 moduleStateCallback[0].call(that);
				            		 }
			            		  // top part of element is visible
			            		 // console.log('Can see the top.');
			            		 } else if (visiblePartY == 'bottom') {
			            		  // bottom part of element is visible
			            		 // console.log('Can see the bottom.');
			            		 } else {
			            		  // whole part of element is visible
			            		     moduleStateCallback[0].call(that);
			            		 }
			            		} else {
			            		 // element has gone out of viewport
			            		}
			            	});
			            	
				this.element.find('.animation').closest('.viewport').find('.replay').click(function() {
                    $(this).closest('.viewport').find('.animation').trigger('click');
					$(this).trigger("fire");
                });
                
                this.element.find('.animation').closest('.viewport').find('.replay').one("fire", function(){
                     fireTag(2471.2,{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'Refresh'});
                });

    }, // end initDesktop
    _viewableCallback: function() {
    
    			var that = this;
    			
      			setTimeout(function() {
                    that.element.find('.animation img').each(function(i) {
                        var thisImg = $(this);
                        setTimeout(function() {
                            thisImg.css('z-index', 300);
                        }, i*200);
                    });
                }, 500);
                that.element.find('.animation').click(function() {

                    $(this).children('img').css('z-index', 0);
                    $(this).children('img').each(function(i) {
                        var thisImg = $(this);
                        setTimeout(function() {
                            thisImg.css('z-index', 300);
                        }, i*200);
                    });
                    
                });

               

	    
    },
    _initMobileAnimation: function() {
        var that = this;
		 that._switchImages(this.element);
    }


}); // end Animation

/**************
 * LFA page specific functions
 *
 * instantiates appropriate modules
 *
 **************/


$.widget('lexus.LFASlider', $.lexus.Slider, {
    _create: function() {
        var that = this;
        this.options.moduleName = this.widgetName;
        this.options.slideWidth = 1280;
        this.options.slideHeight = 563;
        this.options.currentIndex = 0;
        this.options.slideDuration = 800;
        this.options.slideNavOff = '';
        this.options.slideNavOn = '';
        this.options.firetagFired = false; //used to fire firetag for arrow vs dot nav
		this.options.slideNumber = 0;
        this.options.hotspotFiretagFired = false; //used to fire firetag for Hotspots
        this.options.inviewOffset = this.element.offset();
        this.options.filmstrip = this.element.find('.film');
        this.options.currentFrame = 0;
        this.options.filmStripFired = false;
        this.options.lastIndex = 0;
        this.options.fps = 24;
        this.options.module = this.element;
        this.options.prevIndex = 0;
        if(this.element.hasClass('accolade')){
        
		    if(responsive.currentState === 'Desktop'){

				function autoSlide(){
					that._autoAnimateSlides(that.options.module,that.options.currentIndex);
				}

				var accoladeInterval;
				accoladeInterval = window.setInterval(autoSlide, 10000);

				//	Reset Accolade slide time
				$('#accolade-slides').on("click", ".arrow-nav,.slide-nav", function(event){
				    window.clearInterval(accoladeInterval);
				    var $this = $(this)
				    accoladeInterval = setInterval(function(){
				        autoSlide($this)
				    }, 10000);
				});
			}
			
		
		}
		if($('body').hasClass('lfa')){
	

        soundManager.setup({
        	  flashVersion: 9, 
			  preferFlash: false,
			  url: '/lexus-share/v2/vendor/soundmanager/swf/',
			  //playNext: true, // stop after one sound, or play through list until end
			  debugMode: false,
			  onready: function() {
			   basicMP3Player = new BasicMP3Player();
			  },
			  ontimeout: function() {
			   // do something here
			  },
			  defaultOptions: {
			    // set global default volume for all sound objects
			    volume: 88
			  }
		});
		
		}
		
		if(isiPad){
		  ver = iOSversion();
		      if (ver[0] <= 5) {
		    	  this.options.filmStripFired = true;
		    	   this.element.find('.description').show();
		      }
		      else{
		    	  this.options.filmStripFired = false;
		      }
		  }
		  else{
		   	  this.options.filmStripFired = false;
		}
		
        this.options.currentSlide = $('> li', this.element).eq( this.options.currentIndex );
        
        this._initModule();
	
        
    },

    _initLFASlider: function() {
        var that = this;
        $.lexus.Slider.prototype._initSlider.call(this);
    
    },
    _initDesktopLFASlider: function() {
        var that = this;
        that._switchImages(this.element);
	
        var $controls = $('.arrow-nav, .slide-nav', this.element);
		var currentPos = -563;
        this.element.find('.play-audio').click(function() {
            fireTag('2497.14');
        });

        if (this.options.slideNumber <= 1) {
            $controls.remove();
        }
        this.options.filmstrip.css('top', currentPos +'px');

        this.element.find('.description').height("").width("");
        this.element.find('ul.images li img.video-button').css('width', 31 + 'px');

        $('ul.images > li').css({
            width: this.options.slideWidth,
            height: this.options.slideHeight
        });

        if (this.element.find('ul.images li').hasClass('multi-video')) { // Check to see if there's videos
            if (this.element.find('ul.images li .play-video').hasClass('mobile')){
                this.element.find('ul.images li .play-video').not('.mobile').show();
                this.element.find('ul.images li .play-video.mobile').hide();
            }
        }

        if ( this.element.find('.hotspots').length ) {
            that.element.find('.description').children('ul').children('li').children('div.hotspot-text').hide();
            that.element.find('.description').children('ul').children('li').children('div.hotspot-text').eq(0).fadeIn(1000);
            that.element.find('.hotspots img.hotspot').on('click', function(){
                that._hotImage($(this));
            
            });
        }
        if ( !this.element.find('.filmstrip').length ) {
        $('.description ul li', this.element).not('eq(0)').hide().css('z-index',0);
        $('.description ul li:eq(0)', this.element).fadeIn(800).addClass('active').css('z-index',50).css('display','block');

        }
        if ( this.element.find('.filmstrip').length ) {
	        $('.arrow-nav,.slide-nav', this.element).hide().css('z-index',0);
	    if(isiPad){
		  ver = iOSversion();
		      if (ver[0] <= 5) {
		    	 $('.description ul li', this.element).not('eq(0)').hide().css('z-index',0);
				 $('.description ul li:eq(0)', this.element).fadeIn(800).addClass('active').css('z-index',50).css('display','block');
				 if (this.options.slideNumber > 0) {
				 $('.arrow-nav,.slide-nav', this.element).show().css('z-index',444);
				 }		      
			  }
		      else{
		    	  $('.arrow-nav,.slide-nav', this.element).hide().css('z-index',0);
		      }
		  }
		  else{
		   	  $('.arrow-nav,.slide-nav', this.element).hide().css('z-index',0);
		}
	        
        }
        

        that.element.find('.play-audio .action').on('click', function(ev){

            fireTag('2497.14');
        });
        
        
         
    },
    _scrollHandler: function(obj) {
   		var that = this;
   		//console.log('checking....');
    	var moduleStateCallback = eval('[that._viewableCallback]');
    	
	    if( this.element.is(":in-viewport") < 0 ) {
					this.element.trigger("appear");    
		}
															      
		this.element.one("appear", function(){
				//console.log('appear....');
				 moduleStateCallback[0].call(that);
		});
		$(window).off('scroll.'+that.options.moduleName+'');

    },

    _initMobileLFASlider: function() {
        var that = this;
  
        that._switchImages(this.element);
        var ulWidth,ulPlace = 0;
        var max = 200;
        this.element.find('.thumb').hide().removeClass('active').css('z-index',50);  
        this.options.slideWidth = $(window).width();
        
        ulWidth = this.element.find('ul.images li').length * this.options.slideWidth;
        ulPlace = this.options.slideWidth * this.options.currentIndex;
        this.element.find('ul.images').css('width', ulWidth);
        this.element.find('ul.images li, ul.images li img').not('.replay,.film').css('width', this.options.slideWidth);
        this.element.find('ul.images li img.video-button').css('width', 60 + 'px');

        this.element.find('.replay').remove();
        this.element.find('.film').css('display','none');
        this.element.find('li.filmstrip').off('inview');


        this.element.find('.description ul li').each(function(){
            var h = $(this).height();
            if(h > max)
                max = h;
        });
        this.element.find('.description').height(max);
        this.element.find('.copy').height(max);
        this.element.find('.description ul li').height(max).width(this.options.slideWidth-40);
      	
        if (this.element.find('ul.images li').length > 1 ) {
              this.element.find('.description').css('top','-22px');
        }
       
        
        this.element.find('.description ul li').not('eq(0)').hide().css('z-index',0);
        this.element.find('.description ul li:eq(0)').fadeIn(800).addClass('active').css('z-index',50);
        if ( this.element.find('.hotspots').length ) {
            that.element.find('.description').children('ul').children('li').children('div.hotspot-text').hide();
        }

        if (this.element.find('ul.images li').hasClass('multi-video')) { // Check to see if there's videos

            this.element.find('ul.images li .play-video').show();

            this.element.find('ul.images li .play-video').children('.video-thumb').css('background','none');
            // this.element.find('.play-button').attr('src', this.element.find('.play-button').data('src'));

        }


    },
    _viewableCallback: function() {
	    	var that = this;
	        if (that.options.filmStripFired===false){
        	//this.element.find('.description,.play-video').hide();
            var $currSlide = $('ul.images li.filmstrip', that.element);
            var replayBtn = '<img src="/lexus-share/v2/img/replay.png" class="replay">';
            var currentPos = -563;
			var thisModule = this.element;
			
            this.options.filmstrip.css('top', currentPos +'px');
            
			}
		
			if(that.options.moduleState =='loaded' && that.options.filmStripFired===false){		
				   
		
				$currSlide.bind('inview', function(event, isInView, visiblePartX, visiblePartY) {
			            		if (isInView) {
			            				
			            		 // element is now visible in the viewport
			            		 if (visiblePartY == 'top') {
			            		 
			            		 if( $("html").hasClass("ie8") ) { 
			            		 
									 that._filmStrip(); 
								}
									 
			            		  // top part of element is visible
			            		  //console.log('Can see the top.');
			            		 } else if (visiblePartY == 'bottom') {
			            		  // bottom part of element is visible
			            		  //console.log('Can see the bottom.');
			            		 } else {
			            		  // whole part of element is visible
			            		  if(isiPad){
			            		  ver = iOSversion();
									  if (ver[0] <= 5) {
										  thisModule.find('.film').remove();
										  
										  //that._fadeInContent(thisModule);
										  
							    	  }
							    	  else{
							   			   that._filmStrip(); 
							   		  }
							   	  }
							   	  else{
								   	  that._filmStrip(); 
							   	  }
			            		 
			 
			            		 }
			            		} else {
			            		 // element has gone out of viewport
			            		}
			     });
				 
		    
		    }
		    else {
			     // do nothing   
			}
		    

		  	
	        //window.clearInterval();
	        
	       
	       
    },
    _firstModuleAnimateTrigger: function(){
        var that = this;
		//console.log(that.element.attr('class'));
	    $('html, body').animate({scrollTop: 2}, 1000);

    },
     _filmStrip: function(){
     		var that = this;
     		this.element.find('.description,.play-video').hide();
            var $currSlide = $('ul.images li.filmstrip', that.element);
            var $currModule = this.element;
            var replayBtn = '<img src="/lexus-share/v2/img/replay.png" class="replay">';
            var $content = $currSlide.find('> *').not('.film');
            var $description = this.element.find('.description li.active');
            var $filmstripDataFrameEnd = this.options.filmstrip.data('filmstrip-end');
            var $filmstripDataLoop = this.options.filmstrip.data('filmstrip-loop');
            var $filmstripName = this.element.data('module-name');
            var duration = 83*$filmstripDataFrameEnd;
            var endPos = this.options.filmstrip.data('filmstrip-pos')-563;
           // alert(currentPos);
            var currentPos = -563;
				
	            		/* setup filmstrip */
	            
	            		$currSlide.append(replayBtn);
						$currSlide.find('.replay').on('click',function(){
				fireTag(2471.2,{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'Refresh'});
							that._filmStrip(); 

					    });

	            		that.element.find('.description ul li:eq(0)').hide().css('z-index',0);
	            		that.element.find('.description ul li:eq(0) .play-audio').hide();
	            		$currSlide.find('.replay,.play-video').hide();
	            		/* execute filmstrip */
	            		var filmStrip = window.setInterval(function(){

	                that._play(that.options.filmstrip,currentPos);
 
                   		currentPos = currentPos-563;
                   		
                   		if(currentPos<=endPos){
                   		
                   			that._stop(that.options.filmstrip,currentPos);
                   			//alert(that.element);
                   			
	                   		clearInterval(filmStrip); 
	                   		
	                   		
	                   		 window.setTimeout(function(){
				      
							      var thisFilmStripModule = that.options.filmstrip.closest('.module');
							      
							     // thisFilmStripModule.find('.description ul li:eq(0)').hide().removeClass('active').css('z-index',0);
							       
							      that._fadeInContent(thisFilmStripModule);
							      
							      that.options.filmStripFired = true;
							      
							      
						      },42);
	                   		
	                   		
	                   		
                   		}
                  
                   		
			            },42); 
			
		         
			             $currSlide.off('inview');
	},    
	_play: function(obj,currentPos){
		            var that = this;
			            obj.css('top', currentPos +'px'); 
                   		     //	console.log('play at' + currentPos);                
			          	return currentPos;
			         
	},
		           
	_stop: function(obj,currentPos){
		            var that = this;
                   		     	var $currSlide = that.options.filmstrip;
                   		     	
                   		     	$currSlide.find('.replay').show();
                   		     	
                   		     	//console.log('finished at' + currentPos);
                 
		
                   		     	return currentPos;
	},	
				   
	_fadeInContent: function(obj){
				   var that = this;

				   //console.log(obj.find('.description ul li:eq(0)'));
				   obj.find('.description').show();
				   obj.find('.description ul li').hide();
				   obj.find('.description ul li:eq(0) .play-audio').hide();
				   obj.find('.thumb,.video-button').fadeIn(400).addClass('active').css('z-index',50);  
				   obj.find('.description ul li:eq(0)').fadeIn(400).addClass('active').css('z-index',50);		
				   obj.find('li.filmstrip .play-video,.description ul li:eq(0) .play-audio,.replay,.arrow-nav,.slide-nav').delay(400).fadeIn(400).addClass('active').css('z-index',50);
		
				  // obj.find('.description ul li:eq(0) .play-audio').delay(800).fadeIn(800).addClass('active').css('z-index',50);
				   
	}, 
    _resizeCallback: function() {
        var ulWidth,ulPlace = 0;
        var max = 0;
//resize video
        this.element.parent().find('.videoplayer').css('height', this.element.parent().find('.video').height());


        if (responsive.currentState == 'Mobile')
        {
            this.options.slideWidth = $(window).width();
            this.options.slideHeight = 'auto';
            ulWidth = this.element.find('ul.images li').length * this.options.slideWidth;
            this.element.find('ul.images').css('width', ulWidth);
            this.element.find('ul.images li')
                .css('width', this.options.slideWidth)
                .css('height', this.options.slideHeight);
            this.element.find('ul.images li img').not('.replay').css('width', this.options.slideWidth);
            this.element.find('ul.images li img').not('.replay').css('height', this.options.slideHeight);
    
            this.element.find('.video-button').css('width', 62 + 'px');
            this.element.find('.video-button').css('height', 62 + 'px');

            this.element.find('.description ul li').each(function(){
            var h = $(this).height();
            if(h > max)
                max = h;
        });
        this.element.find('.description').height(max);
        this.element.find('.copy').height(max);
        this.element.find('.description ul li').height(max).width(this.options.slideWidth-40);

            this.options.currentIndex = 0;
            this.element.find('.wrapper').scrollLeft(0);
            
              if (this.element.find('ul.images li').length > 1 ) {
              this.element.find('.description').css('top','-22px');
              }

        }
        if (responsive.currentState == 'Desktop')
        {
            this.options.slideWidth = 1280;
            this.options.slideHeight = 563;
            ulWidth = this.element.find('ul.images li').length * this.options.slideWidth;
            this.element.find('ul.images').css('width', ulWidth);
            this.element.find('ul.images li').css('width', this.options.slideWidth);
            this.element.find('ul.images li').css('height', this.options.slideHeight);
            this.element.find('ul.images li img').not('.replay, .film').css('width', 'auto');
            this.element.find('.video-button').css('width', 31 + 'px');
            this.element.find('.video-button').css('height', 31 + 'px');
            this.element.find('.description,.copy,.description ul li').height('').width('');
            this.element.find('.description').css('top','');
           // this.element.closest('.module').css('opacity','1');
        }

    },
      _autoAnimateSlides: function(obj,index) {
		var that = this;
		if(that.options.currentIndex === 0 ){
		that.options.currentIndex++; 
		
		index = obj.find('.slide-nav li').eq(that.options.currentIndex);
		console.log(this.options.currentIndex+','+this.options.slideNumber);
	    that._moveSlides(index);
		}
		else if(that.options.currentIndex > 0 && that.options.currentIndex < that.options.slideNumber - 1){
		that.options.currentIndex++; 
		
		index = obj.find('.slide-nav li').eq(that.options.currentIndex);
		console.log(this.options.currentIndex+','+this.options.slideNumber);
	    that._moveSlides(index);
		}
		else if(that.options.currentIndex === that.options.slideNumber){
		
		that.options.currentIndex = 0;
		index = obj.find('.slide-nav li').eq(0);
		console.log(this.options.currentIndex+','+this.options.slideNumber);
		that._moveSlides(index);	
		}
		else{
		
		that.options.currentIndex = 0;
		index = obj.find('.slide-nav li').eq(0);
		console.log(this.options.currentIndex+','+this.options.slideNumber);
		that._moveSlides(index);	
		}
		return this.options.currentIndex;
	
	},
    _moveSlides: function(obj) {
        var that = this,
            thisSlide = 0;	
        // alert('_moveSlides')
        this.options.currentIndex = obj.index();

		if(this.options.currentIndex !=  this.options.prevIndex){

        if (responsive.currentState === 'Mobile'){
            thisSlide=(this.options.currentIndex * $(window).width());
        }
        else if (responsive.currentState === 'Desktop'){
            thisSlide=(this.options.currentIndex * 1280);
        }

		
        this.element.find('.description ul li').hide().removeClass('active').css('z-index',0);

        //this.element.find('ul.images').css('-webkit-transform','translate3d('+thisSlide+'px,0,0)');
        this.element.find('.wrapper').animate({
            scrollLeft : +thisSlide
        }, 500, 'easeOutQuad');
		
        this.element.find('.description ul li:eq('+this.options.currentIndex+')').fadeIn(800).addClass('active').css('z-index',50);
      

        obj.parent('ul').find('img').attr('src', that.options.slideNavOff);
        obj.find('img').attr('src', that.options.slideNavOn);

        if (responsive.currentState === 'Desktop'){
//          Check to see if slider is at either end of the index and hide or show arrows based on index position
            var arrowNav = this.element.find('.arrow-nav');
            if (obj.index() == that.options.slideNumber-1) {
                arrowNav.find('li.right').fadeOut();
            } else { arrowNav.find('li.right').fadeIn(); }
            if (obj.index() == 0) {
                arrowNav.find('li.left').fadeOut();
            } else { arrowNav.find('li.left').fadeIn(); }
        }
//        console.log(this.options.currentIndex);
        //this.options.firetagFired = false;

        this.options.prevIndex = this.options.currentIndex;
        return this.options.currentIndex;
        }

    },
    _hotImage: function(obj) {
        var that = this;
        //$(this).parents('.viewport').find('img.hotspot').unbind('mouseover', hotImage);
        var clicked = obj.attr('id'); // save the id of the clicked hotspot, formats the image name

        obj.parent('li.hotspots').children('img.fullwidth').attr('src', '/lexus-share/v2/img/models/'+modelCode+'/explore/hotspots/'+clicked+'-hotspot.jpg');
        obj.parent('li.hotspots').parent('ul').parent('.wrapper').parent('.viewport').children('.description').children('ul').children('li').children('div.hotspot-text').hide();
        obj.parent('li.hotspots').parent('ul').parent('.wrapper').parent('.viewport').children('.description').children('ul').children('li').children('div.'+clicked+'').show();
        
        if (this.options.hotspotFiretagFired == false) {
            fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'Expand'});
        }
        this.options.hotspotFiretagFired = true;

    }, // end hotImage


    _audioPlayerCreate: function() {

        var $audio = $('.play-audio', this.element);
        var dfr = new $.Deferred();

        if ($audio.length > 0) {

            switch ( $audio.data('size') ) {
                case 'extrasmall':
                    this.options.mediaelementplayer.audioWidth = 45;
                    this.options.mediaelementplayer.audioHeight = 45;
                    this.options.mediaelementplayer.features = ['playpause'];

                    dfr.done();

                    break;
                // case 'small':
                //     break;
                // case 'medium':
                //     break;
                // case 'etc':
                //     break;
            }

        }

        return dfr.resolve();

    },

    _initAudioPlayer: function() {
        var that = this;
        var $audio = $('.play-audio', this.element);
        // var $audio = $('.play-audio', that.element);

        if ($audio.length > 0) {

            $('audio', $audio).mediaelementplayer( that.options.mediaelementplayer );

            // Bind label to play/pause mediaelement
            if ( $('.play-audio-label', $audio).length > 0 ) {
                $('.play-audio-label', $audio).on('click', function(ev){
                    ev.preventDefault();
                    $(this).parents('.play-audio').find('.mejs-playpause-button').trigger('click');

                     fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<module>': $.trim(that.element.data('module-name')), '<action>': 'Rev Engine'});
                });
                
                 $('.play-audio .action').on('click', function(ev){
                   
                     fireTag('2497.14');
                });
            }

        }
    }

});

$.widget('lexus.TimelineSlider', $.lexus.Slider, {
     _create: function() {
        var that = this;
        var timelineCallbacks = $.Callbacks();
        this.options.moduleName = this.widgetName;
        this.options.slideWidth = 1280;
        this.options.slideHeight = 563;
        this.options.slideNumber = 0;
        this.options.currentIndex = 0;
        this.options.slideDuration = 800;
        this.options.slideNavOff = '';
        this.options.slideNavOn = '';
        this.options.firetagFired = false; //used to fire firetag for arrow vs dot nav
        this.options.currentSlide = $('> li', this.element).eq( this.options.currentIndex );
        this.options.saveMarkUp = this.element.find('ul.images').html();
        this._initModule();
        this.element.find(".wrapper").swipe("destroy"); // disables the original slider swipe, causing problems

        //this.element.find('.arrow-nav li.right').off('click');
        //this.element.find('.arrow-nav li.left').off('click');
        //this.element.find('.arrow-nav li.right').off(-nav li.left').off('click');
         this.options.module = this.element;

    },
    _initTimelineSlider: function() {
        var that = this;
       // this.options.slideNumber = 10;

// slide nav dots are defined in the HTML. we grab them here
        this.options.slideNavOn = '/lexus-share/v2/img/slide-new_dot_on_white.png';
        this.options.slideNavOff = '/lexus-share/v2/img/slide-new_dot_off_grey.png'; 
        this.options.slideWidth = 1280; 
        this.options.currentIndex = 0;
        this.options.slideNumber = 0;
        this.options.firetagFired = false;
        var slideul = this.element.find('ul.images');
        var slideli = this.element.find('ul.images li.slide');
        var navli = this.element.find('.slide-nav li');
        
// clear slide nav dots before re-populating
        this.element.find('.slide-nav ul').html('');
        this.element.find('.arrow-nav').show();
        this.element.find('.slide-nav').hide();

        //******** this is a duplication of code hack to ge the video working in timeline. this needs to be refactored
        that.element.find('.play-video').on('click', function(e) {
            e.preventDefault();
            that._playVideo($(this));
            $(window).bind("resize", function() {
                that.element.parent().find('.videoplayer').css('height', that.element.parent().find('.fullwidth').height());
            });
//                    $(window).trigger('resize');
        });
        //********

//find description lis and hide them, two methods (one for iE8 and CSS3 for other browsers)
            //build out carousel nav dots
            $.each(this.element.find('ul.images li.slide'), function (i) {
                var img = (i == 0) ? that.options.slideNavOn : that.options.slideNavOff;

                that.element.find('.slide-nav ul').append('<li><img data-src="' + img + '" src="' + img + '"/></li>');
                that.options.slideNumber+=1;
            });

            this.element.find('.slide-nav').css('width', ((this.element.find('ul.images li.slide').length) * 23));

            //this.element.find('.arrow-nav').fadeIn();
            this.element.find('.slide-nav').show();
            this.element.find('.arrow-nav li.right').fadeIn();
            // attach click functions to UI
      
			this.element.find('.slide-nav li').click(function (){

                if( that.element.find('.wrapper').is(':animated') ) return true;

                that._moveSlides($(this));
              

            });
            this.element.find('.slide-nav li img').click(function(){
	      
                    fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<section>':sectionName,'<module>': $.trim(that.element.data('module-name')), '<action>': 'Carousel'});
                
            });
            this.element.find('.arrow-nav li.right').on('click',function() {
                if( that.element.find('.wrapper').is(':animated') ) return true;
                that.options.currentIndex++;
                that.options.firetagFired = true;
                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                setTimeout(function(){that.options.firetagFired=false;}, 50);

                fireRight();
                function fireRight(){
                    fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<section>':sectionName,'<module>': $.trim(that.element.data('module-name')), '<action>': 'Right Toggle'});
                }

            }).show();

            this.element.find('.arrow-nav li.left').on('click',function() {
                if( that.element.find('.wrapper').is(':animated') ) return true;
                that.options.currentIndex--;
                that.options.firetagFired = true;
                that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                setTimeout(function(){that.options.firetagFired=false;}, 50);

                fireLeft();
                function fireLeft(){
                    fireTag(that.element.data('firetag'),{'<model_name>':$('body').data('modelname'),'<section>':sectionName,'<module>':$.trim(that.element.data('module-name')), '<action>': 'Left Toggle'});
                }
            }).hide();



                this.element.find('.viewport').swipe({
                    swipeStatus:function(event, phase, direction, distance, fingerCount) {

                        var threshold = 8;
                        var slide = that.options.currentIndex*slideli.width();

                        if (phase=="move" && distance<=threshold) {

                            if(direction == "left") {

                                slide = slide+distance;
                                that.element.find('.wrapper').scrollLeft(slide);
                                //console.log("left "+ slide);
                            }
                            if(direction == "right") {
                                slide = slide-distance;
                                that.element.find('.wrapper').scrollLeft(slide);
                                // console.log("right "+ slide);
                            }

                        }
                        else if (phase=="move" && distance>threshold) {
                            if( that.element.find('.wrapper').is(':animated') ) return true;
                            if(direction == "left") {

                                that.options.currentIndex++;
                                if (that.options.currentIndex<(that.options.slideNumber-1)) {
                                    that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                                }
                                else {
                                    that.options.currentIndex=that.options.slideNumber-1;
                                    that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                                }
                                return false;
                            }
                            if(direction == "right") {
                                if (that.options.currentIndex > 0) {
                                    that.options.currentIndex--;
                                    that.element.find('.slide-nav li').eq(that.options.currentIndex).trigger('click');
                                }

                                return false;
                            }
                        }
                        else if (phase=="end" && distance<threshold) {
                            slide = that.options.currentIndex*slideli.width();

                            that.element.find('.wrapper').animate({
                                scrollLeft : +slide
                            }, 500, 'easeOutQuad');
                            return false;

                        }

                    },
                    threshold:60,
                    allowPageScroll:$.fn.swipe.pageScroll.VERTICAL


                });
            


            
    },

    _moveSlides: function(obj) {
        var that = this,
            thisSlide = 0;

        // alert('_moveSlides')
        this.options.currentIndex = obj.index();

        if (responsive.currentState === 'Mobile'){
            thisSlide=(this.options.currentIndex * $(window).width());
            
         //   if(isiPhone || isiPod || isAndroid){
          //  this.element.find('.arrow-nav').fadeOut(1200);
           // }
          
        }
        else if (responsive.currentState === 'Desktop'){
            thisSlide=(this.options.currentIndex * 1280);
        }

        this.element.find('.wrapper').animate({
            scrollLeft : +thisSlide
        }, 500, 'easeOutQuad');

        obj.parent('ul').find('img').attr('src', that.options.slideNavOff);
        obj.find('img').attr('src', that.options.slideNavOn);

//          Check to see if slider is at either end of the index and hide or show arrows based on index position
            var arrowNav = this.element.find('.arrow-nav');
            if (obj.index() == that.options.slideNumber-1) {
                arrowNav.find('li.right').fadeOut();
            } else { arrowNav.find('li.right').fadeIn(); }
            if (obj.index() == 0) {
                arrowNav.find('li.left').fadeOut();
            } else { arrowNav.find('li.left').fadeIn(); }
       // }

        return this.options.currentIndex;

    },
    _initDesktopTimelineSlider: function() {
        var that = this;
        that._switchImages(this.element);
        this.options.slideWidth = 1280;
        this.options.currentIndex = 0;
        //this.options.slideNumber = 10; // needs more reliable, dynamic method for determining this
        var theHeight = 200;
        //this.element.find('ul.images').css('width', (this.element.find('ul.images li.slide').length * this.options.slideWidth));
        
        if(this.element.find('li.child')){
        
        this.element.find('ul.images').html('');
		this.element.find('ul.images').html(this.options.saveMarkUp);
		
		this._initTimelineSlider();

		}
	
		
		this.element.find('.wrapper').scrollLeft(0);
		
		
		
		
		
		return this.options.currentIndex;
    },

    _initMobileTimelineSlider: function() {
       var that = this;
       that._switchImages(this.element);
       var ulWidth,ulPlace = 0;
       var max = 0;
       this.options.currentIndex = 0;
       //this.options.currentIndex = 0;
             
       this.element.find(".viewport").swipe("destroy");  // makes sure the swipe function is cleared after going from desktop to mobile
       
       // constructs individual mobile slides from col3 desktop slides
       this.element.find('ul.images ul.col3').unwrap();
       this.element.find('ul.images ul.col3 li').unwrap();
       this.element.find('ul.images li').addClass('slide child');
       this.element.find('ul.images li').prev('img').detach();
       this.element.find('.slide-nav ul').html('');
      
      //reinitializes the timeline after DOM manipulaion
       this._initTimelineSlider();
         
       //resizes the elements of the timeline  
           
       this.options.slideWidth = $(window).width();
	       		
	   this.element.find('li.slide').width(this.options.slideWidth);
       
       this.element.find('li.slide,ul.images').height(791);	//temp 	
                 
         
    

	      
	  this.element.find('.bottom').css('width', this.options.slideWidth - 40);
	  this.element.find('p').css('width', this.options.slideWidth - 40);
      
      

            //move the wrapper as the slider is resized
      this.element.find('.wrapper').scrollLeft(this.options.currentIndex*this.options.slideWidth);
    


       
       return this.options.currentIndex;
    },
  
// need to dynamically resize slides for responsive viewport
    _resizeCallback: function() {
        var ulWidth = 0;
        var max = 0;
       // this.options.currentIndex = 0;

        if (responsive.currentState == 'Mobile')
        {
           this.options.slideWidth = $(window).width();
      
           this.element.find('ul.images li.slide').css('width', this.options.slideWidth);
          
            this.element.find('ul.images li.slide').each(function(){
                var h = $(this).height();
                if(h > max)
                max = h;
                 //console.log(h);
            });
            this.element.find('ul.images li.slide').height(max);
            this.element.find('.bottom').css('width', this.options.slideWidth - 40);
            this.element.find('p').css('width', this.options.slideWidth - 40);
            //move the wrapper as the slider is resized
            this.element.find('.wrapper').scrollLeft(this.options.currentIndex*this.options.slideWidth);

            
        }
        if (responsive.currentState == 'Desktop')
        {
            this.options.slideWidth = 1280;
            ulWidth = this.options.slideNumber * this.options.slideWidth;
            this.element.find('ul.images li.slide').css('width',this.options.slideWidth);
            this.element.find('ul.col3 li').css('width',304+'px');
            this.element.find('.wrapper').scrollLeft(this.options.currentIndex*this.options.slideWidth);

        }
        return this.options.currentIndex;
    }
    
});



/**************
 * utility functions
 **************/
function ucfirst(string)
{
    if (string)
        return string.charAt(0).toUpperCase() + string.slice(1);
    else
        return '';
}



//}(jQuery));


/* window scrolling functions to change the navigation */

function isScrolledIntoView(elem)
{
    try {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));
    } catch(e) {
        return false;
    }
}


$('.section-header .arrow').click(function() {
    if ($(this).css('background-image').indexOf('arrow-up')>0) {
        fireTag('2480.1',{'<model_name>':$('body').data('modelname'),'<section>': 'Explore','<subsection>':$(this).closest('.section-header').data('module-name') });
        $('#'+$(this).closest('.section-header').attr('id')+'-section').height(34);
        $(this).css('background-image','url(/lexus-share/v2/img/arrow-down.png)');
    } else {
        $('#'+$(this).closest('.section-header').attr('id')+'-section').height('auto');
        $(this).css('background','url(/lexus-share/v2/img/arrow-up.png)');
    }
});


/* adjust window scroll so that section headers appear under sticky nav */
$('#nav3ButtonList li a').each(function() {
    $(this).click(function(){
        try {
            var $link = $(this).attr("href");
            $('html,body').scrollTop($('#'+$link.match(/#(.+)/i)[1]).offset().top-68);
            return false;

        } catch(e) {}
    });
});
/* end scroll functions */


//var footertagfired = false;
//$('.mobileFooter, #desktopFooter').bind('inview', function (event, visible, visiblePartX, visiblePartY) {
//    if (visiblePartY == 'top') {
//        if (!footertagfired ) {
//            fireTag('2470.7',{
//                '<model_name>':modelName,
//                '<section>': sectionName
//            });
//            footertagfired = true;
//        }
//    }
//});

var player;//a reference to the experience module
var videoPlayer;  //a reference to the videoPlayer module
var content;
var exp;
var vidseq;

// called when template loads, we use this to store a reference to the player and modules
// and add event listeners for the video load (when the user clicks on a video)
function onTemplateLoaded(experienceId) {
    player = brightcove.getExperience(experienceId)
    videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
    $('.videoplayer').on('inview', function (event, visible, visiblePartX, visiblePartY) {
        if (!visible) {
            videoPlayer.pause(true)
        } else if (visiblePartY == 'top') {
            videoPlayer.pause(true)
        } else if (visiblePartY == 'bottom') {
            videoPlayer.pause(true)
        } else {
            videoPlayer.pause(false)
        }

    })
}


function onSeqLoaded(experienceId) {
    player = brightcove.getExperience('vidseq0')
    vidseq = player.getModule(APIModules.VIDEO_PLAYER);
    exp = player.getModule(APIModules.EXPERIENCE);
    vidseq.setRenditionSelectionCallback(selectRendition);
    vidseq.addEventListener(
        BCMediaEvent.BEGIN,
        function() {
            setTimeout(function() {
                $('.videoSeq, .videoSeqD').show();
                $('.videoSeq').css({'opacity': 1});
            }, 1500);
        });
    vidseq.addEventListener(
        BCMediaEvent.STOP,
        function() {
            $('.videoSeq, .videoSeqD').hide();
            $(window).trigger('IntroSeqEnd');
        });



}

function togglePause(){
//if you pass true (or no parameters) to pause
//the video will pause
//see http://docs.brightcove.com/en/player/com/brightcove/api/modules/VideoPlayerModule.html#pause()
//for more info
    if(videoPlayer.isPlaying()){
        videoPlayer.pause(true);
    }else{
        videoPlayer.pause(false);
    }
}

// get the highest rendition of video
function selectRendition(context) {
    var renditions = context.renditions;
    var renditionIndex = -1;
    var size = 0;
    for (var i = 0; i < renditions.length; i++) {
        // set the rendition index for the rendition with the largest size
        if (renditions[i].size > size) {
            size = renditions[i].size;
            renditionIndex = i;
        }
    }
//    describeRendition(context.renditions[renditionIndex]);
    return renditionIndex;
}


/**************
 * lexus.NewModule object
 * - extended from lexus.Module .module Object
 **************/
 /**************
 $.widget('lexus.NewModule', $.lexus.Module, {
     _create: function() {
	     this.options.moduleName = this.widgetName;
	     this._initModule();
	     this._initSlider();
     },
     _init.NewModule function() {
     var that = this;
     	// init all states for Module here
     
     },
     _initDesktop.NewModule: function() {
     var that = this;
       // init Desktop state for Module here
     
     },
   
     _initMobile.NewModule: function() {
     var that = this;
      // init Mobile state for Module here
     
     },
     _resizeCallback: function() {
     var that = this;
     	// this happens on window resize
     	// another method for accessing States for a function needed in more than one State
     	if(responsive.currentState === 'Desktop'){
	    // do this in Desktop State
	    	
     	}
     	else if(responsive.currentState === 'Mobile'){
	    // do this in Mobile State
	     	
     	}
     },
     _viewableCallback: function(){
	    // initialize module events for objects that need to appear when the module is loaded and in the viewport 
     }
     
});
 **************/
/**************
 * lexus.NewSubModule object
 * - extended from lexus.NewModule .module Object
 **************/
 /**************
$.widget('lexus.NewSubModule', $.lexus.NewModule, {
     _create: function() {
	     this.options.moduleName = this.widgetName;
	     this._initModule();
	     this._initNewModule();
     },
     _init.NewSubModule function() {
     var that = this;
     	// init all states for Module here
     
     }
});
 **************/
 function iOSversion() {
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }
}
