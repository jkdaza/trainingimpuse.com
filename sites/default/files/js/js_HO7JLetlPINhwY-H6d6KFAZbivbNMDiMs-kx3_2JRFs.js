/*
 * TwitStream - A jQuery plugin for the Twitter Search API
 * Version 1.2
 * https://kjc-designs.com/TwitStream
 * Copyright (c) 2009 Noah Cooper
 * Licensed under the GNU General Public License <https://www.gnu.org/licenses/>
*/
/*
 * Drupal wrapper by Dario Faniglione
 * 
 */
(function ($) {

  Drupal.behaviors.exampleModule = {
    attach: function (context, settings) {
    	String.prototype.linkify=function(){
    		return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&;\?\/.=]+/g,function(m){
    			return m.link(m);
    		});
    	};
    	String.prototype.linkuser=function(){
    		return this.replace(/[@]+[A-Za-z0-9-_]+/g,function(u){
    			return u.link("https://twitter.com/"+u.replace("@",""));
    		});
    	};
    	String.prototype.linktag=function(){
    		return this.replace(/[]+[A-Za-z0-9-_]+/,function(t){
    			return t;
    		});
    	};
    	var showTweetLinks='none';
    	function fetch_tweets(elem){
    		$ = jQuery;
    		elem=$(elem);
    		keyword=escape(elem.attr('title'));
    		num=elem.attr('class').split(' ').slice(-1);
    		var url="https://search.twitter.com/search.json?q="+keyword+"&rpp="+num+"&callback=?";
    		var cTime=new Date();
    		$.getJSON(url,function(json){
    			$(json.results).each(function(){
    				var tTime=new Date(Date.parse(this.created_at));
    				
    				var sinceMin=Math.round((cTime-tTime)/60000);
    				if(sinceMin==0){
    					var sinceSec=Math.round((cTime-tTime)/1000);
    					if(sinceSec<10)
    						var since='less than 10 seconds ago';
    					else if(sinceSec<20)
    						var since='less than 20 seconds ago';
    					else
    						var since='half a minute ago';
    				}
    				else if(sinceMin==1){
    					var sinceSec=Math.round((cTime-tTime)/1000);
    					if(sinceSec==30)
    						var since='half a minute ago';
    					else if(sinceSec<60)
    						var since='less than a minute ago';
    					else
    						var since='1 minute ago';
    				}
    				else if(sinceMin<45)
    					var since=sinceMin+' minutes ago';
    				else if(sinceMin>44&&sinceMin<60)
    					var since='about 1 hour ago';
    				else if(sinceMin<1440){
    					var sinceHr=Math.round(sinceMin/60);
    					if(sinceHr==1)
    						var since='about 1 hour ago';
    					else
    						var since='about '+sinceHr+' hours ago';
    				}
    				else if(sinceMin>1439&&sinceMin<2880)
    					var since='1 day ago';
    				else{
    					var sinceDay=Math.round(sinceMin/1440);
    					var since=sinceDay+' days ago';
    				}
    				var tweetBy='<a class="tweet-user" target="_blank" href="https://twitter.com/'+this.from_user+'">@'+this.from_user+'</a> <span class="tweet-time">'+since+'</span>';
    				if(showTweetLinks.indexOf('reply')!=-1)
    					tweetBy=tweetBy+' &middot; <a class="tweet-reply" target="_blank" href="https://twitter.com/?status=@'+this.from_user+' &in_reply_to_status_id='+this.id+'&in_reply_to='+this.from_user+'">Reply</a>';
    				if(showTweetLinks.indexOf('view')!=-1)
    					tweetBy=tweetBy+' &middot; <a class="tweet-view" target="_blank" href="https://twitter.com/'+this.from_user+'/statuses/'+this.id+'">View Tweet</a>';
    				if(showTweetLinks.indexOf('rt')!=-1)
    					tweetBy=tweetBy+' &middot; <a class="tweet-rt" target="_blank" href="https://twitter.com/?status=RT @'+this.from_user+' '+escape(this.text.replace(/&quot;/g,'"'))+'&in_reply_to_status_id='+this.id+'&in_reply_to='+this.from_user+'">RT</a>';
    				var tweet='<div class="tweet"><div class="tweet-left"><a target="_blank" href="https://twitter.com/'+this.from_user+'"><img width="48" height="48" alt="'+this.from_user+' on Twitter" src="'+this.profile_image_url+'" /></a></div><div class="tweet-right"><p class="text">'+this.text.linkify().linkuser().linktag().replace(/<a/g,'<a target="_blank"')+'<br />'+tweetBy+'</p></div><br style="clear: both;" /></div>';
    				elem.append(tweet);
    			});
    		});
    		return(false);
    	}
    	showTweetLinks=showTweetLinks.toLowerCase();
    	if(showTweetLinks.indexOf('all')!=-1)
    		showTweetLinks='reply,view,rt';
    	$('.twitStream').each(function(){
    		fetch_tweets(this);
    	});
    	
      
    }
  };

})(jQuery);
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Downloads",
            "eventAction": Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(),
            "eventLabel": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", {
            "hitType": "pageview",
            "page": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Mails",
            "eventAction": "Click",
            "eventLabel": this.href.substring(7),
            "transport": "beacon"
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", {
              "hitType": "event",
              "eventCategory": "Outbound links",
              "eventAction": "Click",
              "eventLabel": this.href,
              "transport": "beacon"
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga("send", {
        "hitType": "pageview",
        "page": location.pathname + location.search + location.hash
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        ga("send", {
          "hitType": "pageview",
          "page": Drupal.googleanalytics.getPageUrl(href)
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, https://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - https://mydomain.com/node/1 -> /node/1
 * - https://example.com/foo/bar -> https://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
