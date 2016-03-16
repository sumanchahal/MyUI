(function ($) {
    var footertagfired = false;
    var videoExists = false;
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
	var currentState = 'unknown';

	// squash IE console errors
	if (typeof console == "undefined") {
	    var console = {
	        log: function () {
	        }
	    }
	}
	
	//HUGE CODE
	if(typeof $.browser == 'undefined'){
	    $.browser = {};
    }
	
	
	$('.breadCrum,.toTop,hr').hide(); // this hides certain elements that were showing up too early
    /**************
     * lexus.lexusUI object
     * - defines different viewport 'states'
     * - each state has a corresponding function block for viewport specific functions
     * - binds an 'inview' event to each module instance for dynamic img resource loading
     * - binds a 'resize' event to each module instance
     * - upon window resize checks current window size against defined viewports array
     * - if viewport width is different from previous viewport width, fires a callback with 'state name'
     * - callbacks
     * -- each module instance has viewport state specific _init functions
     * -- each module instance can have a _resizeCallback hook
     * - handles omniture tags using HTML5 data attributes
     **************/
     console.log('before brightCoveWidget');
    $.widget("lexus.lexusUI", {
        // These options will be used as defaults
        options: {
            moduleState: 'off', // state of the module: 'off' or 'ready'(signifying all resources are loaded)
            moduleName: '',
            brightcoveAPIToken: '6GU9gzrG6vBPEOqXTcBRE70tbmKcJuc_CE8QyAFltqvac2mJq4qRqA..',
            debug: true
        },

        // Set up the widget
        _create: function() {

            var that = this;

            // console.log('lexus.lexusui initialized');

            this._initLexusUI();
          
        },


        _initLexusUI: function() {
			console.log('_initLexusUI()');
            if (responsive.currentState != 'Mobile') {
                this._initSearchBox();
                this._initOwnersDropdown();
                this._initPreOwnedDropdown();

                this._initShoppingToolsDropdown();
                this._initNav2Links();

                this._initOmnitureLinks();
                this._initFooter();
                this._initHashNav();
				this._initDividers();
                this._initDisclaimers();
                this._initBackToTop();
                this._initScrollEvents();

            }
              this._initTabEvents();
			  this._initFeaturesLinks();

        },

        _initHashNav: function() {
            // Jump to Package (Options page) when requested
            var navToLocation=window.location.href;
            var pound=navToLocation.indexOf("?navTo=");
            var pushDown = 73; // offset for sticky nav (desktop)
            var delay = 0;

            var params = getParameters();
            if (params!=null) {
                var navToLocation = params['navTo']; //return to this tab
                if (navToLocation!=null) {

                    if (currentState=='mobile') {
                        var i = navToLocation.substr(1,navToLocation.indexOf('s')-1);
                        $('#openTab' + i).click();
                        pushDown = 53; // offset for sticky nav (mobile)
                        delay = 500; // wait until slideDown finishes
                    }

                    setTimeout(function() {
                        var newSpot = $('#'+navToLocation).offset().top - pushDown;
                        $('html,body').scrollTop( newSpot );
                    }, delay);
                }
            }

        },

        _initSearchBox: function() {
            // prevent submission of empty search
            var searchform = $('#topSearch');
            var searchfield = '#nav_search_field';

            searchform.submit(function() {
                var search_term = ($(this).find(searchfield).val()).toLowerCase();
                if (search_term.length < 2)
                    return false;
                else {
                    fireTag('2300.10');
                    return true;
                }
            });

            if ($.browser.isIE) {
                $(searchfield).val($(searchfield).attr('placeholder'));
            }

            $(searchfield).focus(function() {
                $(this).val('');
                $(this).removeAttr('placeholder');
            });

            $('.inputActivate').click(function(e) {
                e.preventDefault();
                searchform.submit();
            });
        },

        _initOwnersDropdown: function() {
            // Owner's Resources Menu
            var id = '#ownersDrop';
            var that = this;

            $('#ownersDropButton')
                .click( function(e) {
                    e.stopImmediatePropagation();
                    if (!$(id).is(':visible')) {
                        $(this).focus();
                        $(id).fadeIn( 300 );
                    }
                })
                .blur(function() {
                    $(id).fadeOut( 300 );
                });

            $(id).click( function(e) { e.stopPropagation(); });

            $(id).find('a').click(function(e) {
                var tag = '2300.6';
                var category = 'owners resources';

                fireTag(tag, {
                    '<category>':category,
                    '<button_name>':$(this).data('title')
                });
            });

        },

        _initPreOwnedDropdown: function() {
            var id = '#navCPODrop';
            var that = this;

            // Certified Pre-Owned Menu
            $('#navCPODropButton')
                .click( function(e) {
                    if (!$(id).is(':visible')) {
                        $(this).focus();
                        $(id).fadeIn( 300 );
                    }
                    e.stopImmediatePropagation();
                })
                .blur(function() {
                    $(id).fadeOut( 300 );
                });

            $(id).click( function(e) { e.stopPropagation(); });

            $(id).find('a').click(function(e) {
                var tag = '2300.6';
                var category = 'certified preowned';

                fireTag(tag, {
                    '<category>':category,
                    '<button_name>':$(this).data('title')
                });
            });
        },



        _initShoppingToolsDropdown: function() {
            var id = '#shoppingToolsMenu';
            var that = this;
            var clicked = false;

            // Shopping Tools Menu
            $('#shoppingTools').click( function(e) {
                if (!$(id).is(':visible')) {
                    e.stopPropagation();

                    if (!$(this).hasClass('active'))
                        $(this).addClass('active');

                    $(id).focus();
                    $(id).slideDown(300, function() {
                        $(this).find('a').eq(0).focus();
                    });
                }

            });

            $(id).find('a').eq(0).blur(function(e) {
                $(id).slideUp(300, function() {
                    $('#shoppingTools').removeClass('active');
                });
            });

            $(id).click( function(e) { e.stopPropagation(); });

            $(id).find('a').click(function(e) {
                var tag = '2300.6';
                var category = 'shopping tools';

                fireTag(tag, {
                    '<category>':category,
                    '<button_name>':$(this).data('title')
                });
            });

        },

        _initNav2Links: function() {

            $('#nav2ButtonList li a').click( function(e) {

                var section = $.trim($(this).closest('li[data-section]').data('section'));
                var tagID;

                // there is no 'modelName' for /ownership /service or /warranty
                // use 'pageName' instead
				if(subsectionName === 'Owner Benefits' || subsectionName === 'Warranty' || subsectionName === 'Service'){
					 fireTag('2531.9',{
                     '<subsection>': section.capitalize(),
                     '<section>': section.capitalize()
					 });
				}
                else if(modelName==='LFA'){
	               fireTag('2497.2',{
                     '<model_name>':modelName,
                     '<section>': section.capitalize()
					 });
                }
                else {
	    
	               fireTag('2470.4',{
                     '<model_name>':modelName,
                     '<section>': section.capitalize()
                   });
                }
                 
            });
			var navMarginFix = 0;
            $('#nav3 a').click(function(e) {
                var section = $.trim($('#nav2 li a.active').text());
                var subsection = $.trim($(this).text());
                var tagID;
                if(modelName==='LFA'){
	                tagID = '2497.3'
                }
                else {
	                tagID = '2470.5'
                }
                fireTag(tagID,{
                    '<model_name>':modelName,
                    '<section>':section.capitalize(),
                    '<subsection>':subsection
                });
				if($('body').hasClass('explore')){

			        if(navMarginFix === 0){  // this fixes the section position on explore after first click of nav

				  		  setTimeout(function(){ // makes it work in ie8+

				  					  if($('body').hasClass('lfa')){
				  					     $('html, body').animate({scrollTop: $(window).scrollTop() + 4 }, 5);
				  					  }
				  					  else{
				  						   $('html, body').animate({scrollTop: $(window).scrollTop() - 68 }, 5);
				  					  }


				  		  }, 100)

			        }
			        navMarginFix++;
			    }
            });
        },

        _initFeaturesLinks: function() {
 
	    /* show Differences logic */
        $('tr.tableDataRow td.tableData').each(function(){

		       if ($(this).html()===$(this).siblings('td.tableData').html() ) {
			       	// do nothing
		       }
		       else {
			       $(this).parent('tr.tableDataRow').addClass('notEqual');
			   }

	      });

	        $('#showDifferences input').on('click',function() {

			 if ( $('#showDifferences input').is(':checked') ) {

                    $('tr.tableDataRow').not('.notEqual').addClass('hide');

                 var tagid=($('body.lfa').length) ? '2498.4':'2474.3';

                    fireTag(tagid,{
                        '<model_name>':modelName,
                        '<section>':sectionName,
                        '<action>':'Show Differences'
                    });
                } else {
                   $('tr.tableDataRow').not('.notEqual').removeClass('hide');
                }

          });


	      $('#accessories_container .tabContent .action').on('click',function() {
              var tagid=($('body.lfa').length) ? '2498.4':'2474.3';

		       fireTag(tagid,{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':$(this).data('action')
                    });
          });
           /* omniture tags */
            $('img.print-icon').click(function() {
                var tagid=($('body.lfa').length) ? '2498.4':'2474.3';

                fireTag(tagid,{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':'Print'
                });

                window.print();
            });

            $('#emailShare').click(function(e) {
                var tagid=($('body.lfa').length) ? '2498.4':'2474.3';

                e.preventDefault();

                $('body').append('<iframe src="'+$(this).attr('href')+'" height=1 width=1/>');

                fireTag(tagid,{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':'Email'
                });

            });

            $('#headerButtonList .buildyourlexus').click(function(){
                fireTag('2300.2',{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':'Email'
                });
            });

            $('#headerButtonList .findadealer').click(function(){
                fireTag('2300.3',{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':'Email'
                });
            });

            $('.mobility-pdf, .mobility-icon').click(function() {
                fireTag('2474.3',{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':'Mobility Program PDF'
                });
            });


            $('.compete-link').click(function() {
                fireTag('2474.3',{
                    '<model_name>':modelName,
                    '<section>':sectionName,
                    '<action>':'Compare'
                });
            });

     },

        _initOmnitureLinks: function() {
            //handle outbound links

            // convert title attribute to data-title to prevent tooltips from showing
            // we do this to address accessibility using title tags but we don't want them to show on hover
            $('a[title]').each(function() {
                var title = $(this).attr('title');
                $(this).data('title', title);
            });

            // for each link, check for omniture HTML5 data attributes and if found, execute omniture
            // we'll need to strip out the code from explore
            // we're assuming that <model_name> will be required for all of these tags
            $('[data-firetag][firetag-details]').click(function(e) {
//                e.preventDefault();
                var tag = $(this).data('firetag');
                var modelName = $('body').data('modelname');
                var details = eval("({'<model_name>':'"+modelName+"',"+$(this).data('firetag-details')+"})");
                fireTag(tag, details);
            });
        },

        _initFooter: function() {
            $('.footer ul:not(.ulInformation) li a').click(function(e) {
//                e.preventDefault();

                var category = $.trim($(this).parents('ul').prev().html());
                var txtLink = $.trim($(this).text());

                fireTag('2476.1',{
                    '<category>': (category) ? category : 'Social Links',
                    '<link>':txtLink
                });
            });

            $('.footer ul.ulInformation li a').click(function(e) {
//                e.preventDefault();

                var txtLink = $.trim($(this).text().replace('(PDF)', ''));

                fireTag('2476.2',{
                    '<link>':txtLink
                });
            });
        },
        _initTabEvents: function(){

		    //----------------------
		    // Click to Change Tab
		    //----------------------
		    $('.tabContent').hide();
		    if (responsive.currentState == 'Desktop') $('.tabContent.active').show();
			
		        $(".tabLabel").on("click", function(event) {
					  var url = window.location.href;
					  var activeTab = $.trim($(this).find('.tabText').text());
					  var activeTabTag = $(this).data('tabtag');
				
		            $('.tab').removeClass('active');
		            $('.tabContent').removeClass('active'); // desktop
		            $('.mobileTabContent').removeClass('active'); // mobile

		            $(this).parent('li').addClass('active');
		            $('#' + $(this).parent('li').attr("rel")).addClass('active'); // desktop
		            $('.' + $(this).parent('li').attr("rel")).addClass('active'); // mobile

		            if (responsive.currentState == 'Desktop') {
		                $('.tabContent').hide();
		                $('#' + $(this).parent('li').attr("rel")).show();
		            }
		            if (responsive.currentState == 'Mobile') {
		                if ($('#mobileTab' + $(this).parent('li').attr("rel")).is(':hidden')) {
		                    // there is a small bug here -- the slideDown goes to far because the browser thinks the height is larger than it really is
		                    //alert( 'height is ' + $( '#mobileTab' + $(this).parent('li').attr("rel") ).css("height") );
		                    $('#mobileTab' + $(this).parent('li').attr("rel")).slideDown(500);
		                    $(this).parent('li').find(".menuArrow").addClass("activated");
		                }
		                else {
		                    $('#mobileTab' + $(this).parent('li').attr("rel")).slideUp(500);
		                    $(this).parent('li').find(".menuArrow").removeClass("activated");
		                    return;
		                }
		            }
		            
					if (responsive.currentState == 'Desktop' || $(this).parent('li').find(".menuArrow").addClass("activated") ) {

                    // there is no 'modelName' for /ownership /service or /warranty
                    // use 'pageName' instead
					//if(!typeof modelName='undefined') 
					if(subsectionName === 'Warranty' || subsectionName === 'Service'){
					
					    tagID = '2531.3'
					    fireTag(tagID, {
					    '<section>':sectionName,
					    '<subsection>':subsectionName,
					    '<page>': activeTabTag
						});
						return;
					
					}
					else if(modelName==='LFA' && sectionName==='Gallery'){
					
					    tagID = '2499.4'
					    activeTab = (activeTab.capitalize().indexOf('gring Edition') > 0) ? 'LFA Nürburgring ' : activeTab;
					}
					else if(modelName === 'LFA'){
	                     tagID = '2498.2';
	          
	                   
					}
					else if(modelName != 'LFA'){
					    
					    tagID = '2472.2'
					   
					}
					 fireTag(tagID, {
					    '<model_name>':modelName,
					    '<section>':sectionName,
					    '<subsection>':subsectionName,
					    '<tab>': activeTabTag
						});
				
					
					
					}
					
				 
				 
		        });

        },
        _initBackToTop: function(){
        	/* Back to Top Functionality */
        	//hide back to top on load
        	$('.toTop').hide();
		    $('.toTop').on('click',function() {
		        //document.location.href="#header";
		        if(subsectionName === 'Owner Benefits' || subsectionName === 'Warranty' || subsectionName === 'Service'){
					//do nothing
				}
				else{									
		        fireTag('2470.6', {
		            '<model_name>': modelName,
		            '<section>': sectionName

		        });
				}
		        $('html, body').animate({scrollTop: 0}, 'fast');
		        return false;
		    });

        },
        _initDisclaimers: function(){
	        	 /* disclaimer methods */



        },
        _initDividers: function(){
          if (responsive.currentState === 'Desktop') {
	      $('hr').show();
	      }
        },

        _initScrollEvents: function(){
        			var that = this;
             		var scroll_ok = true;
			        var scrolloffset;

			        if (!$('body').hasClass("overview")) {
			            scrolloffset = $('.breadCrum').height() + $('#header').height() + $('#categoryNav').height();
			        }
			        if ($('body').hasClass("overview")) {
			            scrolloffset = $('#header').height() + $('#categoryNav').height() + 460; //height of slider is hardcoded, browser wont return correct height()

			        }


					if ($(window).width() > 960) {  // prevent scroll methods from triggering on mobile

								setInterval(function () {
								    scroll_ok = true;
								    if ( $(document).scrollTop() < 100 ) {  //check if window is at the top, prevents nav sticking
									    	that._topNav();
									    	$('.toTop').fadeOut(1200);
			    			        }

								}, 200);//33ms is 30fps, you can try changing this to something larger for better performance
			    			  if (responsive.currentState === 'Desktop') {
			    			    $(window).on("scroll", function(e,offset) {
			    			       if (scroll_ok === true) {
							           scroll_ok = false;
							           that._scrollListener(scrolloffset);
							       }

			    			    });
			    			 }
			        }


			        $('#nav3ButtonList li').click(function() {
			        clearNav();
			        $(this).addClass('currentMenuItem');

			        });

        },

        _scrollListener: function(offset){
			    //---------------------------------------------------------------------------
			    // Click to Change Secondary Nav Tab for Microsite Pages, otherwise in JSP
			    //---------------------------------------------------------------------------
			    	var that = this;

			     //position = ($('#nav2').offset().top - $(window).scrollTop()) * -1;
			     $('#tiptip_holder').hide(); // removes tipTip after scroll
			                // Sticky nav
			      if ( offset > $(document).scrollTop() ) {
				                that._topNav();

			      }
			      if ( $(window).scrollTop() > offset ) {
				                that._fixedNav();

			      }
			      if ( $(window).scrollTop() === 0 ) {
				                that._topNav();
			      }

			      /* Back to top simplified, always executes after 1000 pixels */


			      // Show BacktoTop when user scrolls below 2000px
                if ($(document).height() < ($(window).height() * 2) && responsive.currentState != 'Mobile' ) {

                    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                        $('.toTop').fadeIn(1200);

                    }

                }
                else if ($(document).height() > ($(window).height() * 2) && responsive.currentState != 'Mobile' ) {
                    /*if ( $(window).scrollTop() > ($(document).height() / 2)  ) { /*this was the old method*/
                    if ($(window).scrollTop() > 1000) {
                        $('.toTop').fadeIn(1200);

                    }
                }



				 if($('#desktopFooter').is(":in-viewport") > 0 && footertagfired === false) {

									$('#desktopFooter').on("appear", function(){
									                var firetag;
									                
													if(subsectionName === 'Owner Benefits' || subsectionName === 'Warranty' || subsectionName === 'Service'){
														return false;
													}
									     
									            	else if($('body').hasClass('co-model')){ // compare pages scroll pixel 
										          			  firetag = '2532.5';	
										          			  
										          			  fireTag(firetag,{
									              			      '<campaign>':campaign,
									              			      '<location>': 'Bottom'
									              			  });
												  	          return;
									                
									            	}
									            	else if($('body').hasClass('lfa')){
									            	
									            	firetag = '2497.5';
									            	
									            	}
									            	else{
									            	
									                firetag = '2470.7';
									                
									                }

									                fireTag(firetag,{
									                     '<model_name>':modelName,
									                     '<section>': sectionName
									                });

							         });

							         footertagfired = true;
									 $('#desktopFooter').trigger("appear");
									 $('#desktopFooter').off("appear");

									 if($('.toTop').not(':visible')){
										 $('.toTop').fadeIn();
								     }


				 }

			   	 // Explore, change section nav
			      if($('body').hasClass('explore')){

			                   if( $('.module:first').is(":in-viewport") > 0 ) {
						            clearNav();
						            $('#nav3ButtonList li').eq(0).addClass('currentMenuItem');
						       }
						        $('.section').not('#hero').each(function() { //.not fixes bug in IE8 where user scrolls back up and safety is highlighted

						            if( $('#'+$(this).attr('id')).is(":in-viewport") > 0 ) {
						                clearNav();
						                if ($('#nav3ButtonList li').length==$('.section-header').length)
						                    $('#nav3ButtonList li').eq(($('.section').index($(this)))-1).addClass('currentMenuItem');
						                else
						                    $('#nav3ButtonList li').eq(($('.section').index($(this)))+1).addClass('currentMenuItem');
						            }
						       });

			     }



        },
        _fixedNav: function(){
	        					$('#nav2').css('position', 'fixed').css('top', 0);
			                    if ($('body').hasClass("overview")) {
			                        $('#nav2').nextAll('.module:first').css('margin-top', 0);
			                    }
			                    else {
			                        $('#nav2').nextAll('.module:first').css('margin-top', 72);
			                    }
			                    if ($('#heroImage').is(':visible')) $('#heroImage').css('margin-top', 72);
			                    else if ($('#player').is(':visible')) $('#player').css('margin-top', 100);
			                    else {
			                        $('#nav2').nextAll('.section_container').css('margin-top', 70);
			                        $('#nav2').next('.section').css('margin-top', 0);
			                    }
			                    // Snap CTA buttons from Nav to Nav2 and back
			                    $('#headerButtonSearch').hide();
			                    $('#headerButtonList').css('margin-top', '-7px');
			                    $('#headerButtonList').appendTo('#headerButtonsNav2');
			                    $('#headerButtonList .noSlide').hide();

        },
        _topNav: function(){
	         					$('#nav2').css('position', 'relative');
			                    $('#nav2').nextAll('.module:first').css('margin-top', 0);
			                    if ($('#heroImage').is(':visible')) $('#heroImage').css('margin-top', 0);
			                    else if ($('#player').is(':visible')) $('#player').css('margin-top', 10);
			                    else {


                                    // Bug #246

                                    // removed by Alyssa on 7/24/13. On /service and /warranty it caused a bug where
                                    // the top of the menu would not be displayed IF the user started at a desktop viewport then
                                    // resized down to mobile. However, if the same page is reloaded at mobile then resized to desktop
                                    // then the menu displays properly in both viewports

			                        // $('#nav2').nextAll('.section_container').css('margin-top', 0);
			                        $('#nav2').next('.section').css('margin-top', 0);
			                    }
			                    // Snap CTA buttons from Nav to Nav2 and back
			                    $('#headerButtonList').css('margin-top', '-11px');
			                    $('#headerButtonList').appendTo('.headerButtons');
			                    $('#headerButtonsNav2').children('#headerButtonList').remove();
			                    $('#headerButtonSearch').show();
			                    $('#headerButtonList .noSlide').show();
        },
        playVideo: function(videoContainerObj, options) {
//            console.log('lexusUI.playVideo()')
            /*******
             * creates a brightcove video instance within the html element referenced by videoContainerId
             * Simple Example use:

             $(document).data('lexusUI').playVideo('#player', {
             '@videoPlayer': 1234567889
             });

             * default brightcove paramaters provided below but can be overrode by providing an object with
             * new values
             */

            var vidParams = {
                    'bgcolor': '#f0f0f0',
                    'width': '100%',
                    'height': '100%',
                    'playerID': brightcovePlayerID,
                    'playerKey': 'AQ~~,AAABhuSnaLE~,1jgLZQvAmMbWgCeYEEbAmCDWMos9zxDb',
                    'includeAPI': 'true',
                    'templateReadyHandler': "onTemplateLoaded",
                    'isVid': 'true',
                    'isUI': 'true',
                    'dynamicStreaming': 'false',
                    'autoStart': 'true',
                    'wmode': 'transparent',
                    '@videoPlayer': '1750437673001',
                    'linkBaseURL': location.href.match('http://.[^/]+/')[0]+'models/ES/gallery/videos/'
                },
                vidHTML = '';

            vidParams['width'] = videoContainerObj.css('width');
            vidParams['height'] = videoContainerObj.css('height');

            var ua = navigator.userAgent;
            if( ua.indexOf("Android") >= 0 )
            {
                var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));
                if (androidversion < 3)
                {
                    // Android < 3 has issues opening a video file so use the brightcove player
                    responsive.isAndroid = false;
                }
            }

            //********* launch video in native player on mobile devices
            if (responsive.isiPhone || responsive.isiPod || responsive.isAndroid) {
                $.ajax({
                    url: 'http://api.brightcove.com/services/library?command=find_video_by_id&media_delivery=http&video_id=' + options['@videoPlayer'] +'&video_fields=name,length,FLVURL&token='+this.options.brightcoveAPIToken,
                    type: 'GET',
                    dataType: 'jsonp',
                    success: function(data) {
                        location.href=data.FLVURL;
                    }
                });

            } else {
                //******** create in-page player
                if (videoExists) {
                    $('.BrightcoveExperience').remove();
                    videoExists = false;
                }

                videoExists = true;

                vidHTML+='<object id="video0" class="BrightcoveExperience">';

                for (var k in vidParams) {
                    if (options[k]) {
                        vidHTML+='<param name="'+k+'" value="'+options[k]+'" />';
                    } else {
                        vidHTML+='<param name="'+k+'" value="'+vidParams[k]+'" />';
                    }
                }

                vidHTML+='</object>';

                videoContainerObj.append(vidHTML);

                brightcove.createExperiences();

            }


        },

        onTemplateLoaded: function(experienceId) {
            player = brightcove.getExperience(experienceId);
            videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
            $('#'+experienceId).parent().bind('inview', function (event, visible, visiblePartX, visiblePartY) {
                if (!visible) {
                    videoPlayer.pause(true)
                } else if (visiblePartY == 'top') {
                    videoPlayer.pause(true)
                } else if (visiblePartY == 'bottom') {
                    videoPlayer.pause(true)
                } else {
                    videoPlayer.pause(false)
                }

            });
        }
    });
    
    console.log('after brightCoveWidget');


}(jQuery));

$(document).lexusUI();

String.prototype.capitalize = function() {
    return this.toLowerCase().replace(/^.|\s\S/g, function(a) { return a.toUpperCase(); });
}

//****** this must be in global scope in order for brightcove to see it
function onTemplateLoaded(experienceId) {
    $(document).data('lexusUI').onTemplateLoaded(experienceId);
}

// Retrive URL parameters into array for general use
function getParameters() {
    var ps=window.location.href;
    var ipos=ps.indexOf("?");
    if(ipos<0)
        return null;
    /* ignore everything after #  */

    var pound=ps.indexOf("#");
    if(pound>=0)
        ps=ps.substring(0,pound);

    ps=ps.substring(ipos+1);
    var list=ps.split("&");
    var kv=[];
    var i,s,k,v;
    for(i=0;i<list.length;i++) {
        s=list[i]; ipos=s.indexOf("=");
        if(ipos>=0) {
            k=s.substring(0,ipos); v=unescape(s.substring(ipos+1));
            if(isNaN(v)==false)
                v=parseInt(v);
        }
        else {
            k=s;
            v=true;
        }
        kv[k]=v;
    }
    return kv;
}
/* MISC FUNCTIONS FROM LEXUS.JS */

	/* clearNav() also called in explore.js */
	function clearNav() {
	    $('#nav3ButtonList li').each(function () {
	        $(this).removeClass('currentMenuItem');
	    });
	}

 // set in js/responsive.js
    if (isiPhone > 0 || isiPod > 0) {
        window.addEventListener("load", function () {
            setTimeout(function () {
                document.documentElement.scrollTop || window.scrollTo(0, 1);
            }, 0);
        });
    }
	$('body').css('opacity',1); // what is this doing here?
			    //initialize touch on iOS devices, gets rid of grey square on tap events but not in IE8
    if (!$.browser.msie && parseInt($.browser.version, 10) === 8) {
        document.addEventListener("touchstart", function () {
        }, true);
    }

    // Stripe tables, if any
    $(".zebraStripe tr:nth-child(even)").addClass("even");

  //  $('body').css("opacity", "1");

    if (isiPad) {
        $('.footer .is-desktop-only').hide();
    }