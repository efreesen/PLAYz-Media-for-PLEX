﻿/**
PLAYz Media (PLEX for LG Media Center)

Copyright 2014 Simon J. Hogan (Sith'ari Consulting)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this 
file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under 
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
either express or implied. See the License for the specific language governing permissions 
and limitations under the License.
**/

function PLEX() {
	this.PLEX_SESSION_ID = "plexSessionID";	
  this.LG_PLEX_SERVER = "plexServerUrl";
  this.LG_PLEX_TOKEN = null;
  this.PLEX_OPTIONS_PREFIX = "plexOptions-";  
  this.PLEX_CACHE = "cache:";
  this.PLEX_SHOW_HIDDEN_FILES = "plexHiddenFiles";
  this.X_Plex_Client_Identifier = localStorage.getItem(this.PLEX_SESSION_ID);
  this.X_Plex_Chunked = "1";
  this.X_Plex_Product = "Plex%20Web";
  this.X_Plex_Version = "2.4.9";
  this.X_Plex_Platform = "Chrome";
  this.X_Plex_Platform_Version = "7";
  this.X_Plex_Version = "1.2.12";
  this.X_Plex_Platform_Version = "43.0";
  this.X_Plex_Device = "Windows";
  this.X_Plex_Device_Name = "Plex%2FWeb%20(Chrome)";
	
	var d = new Date();
	this.time = d.getTime();	
};

// Configuration & Settings
PLEX.prototype.getShouldShowHiddenFiles = function () {
    
    if (!localStorage.getItem(this.PLEX_SHOW_HIDDEN_FILES) || localStorage.getItem(this.PLEX_SHOW_HIDDEN_FILES) == "") {
            this.setShouldShowHiddenFiles("false");
            return false;
	} else {
            if (localStorage.getItem(this.PLEX_SHOW_HIDDEN_FILES) == "true") {
                return true;
            } else {
                return false;
            }
	}
};

PLEX.prototype.setShouldShowHiddenFiles = function(value) {
    localStorage.setItem(this.PLEX_SHOW_HIDDEN_FILES, value);
};

PLEX.prototype.isMarkedAsHidden = function (item, val) {
    if ($(item).attr(val).length != 0) {
        return ($(item).attr(val).indexOf("[p]") != -1 || $(item).attr(val).indexOf("[P]") != -1);
    } else {
        return false;
    }
};

PLEX.prototype.setServerUrl = function(url) {
	localStorage.setItem(this.LG_PLEX_SERVER, url); 
};

PLEX.prototype.getServerUrl = function() {
	return localStorage.getItem(this.LG_PLEX_SERVER);    
};

PLEX.prototype.setServerToken = function(token) {
  localStorage.setItem(this.LG_PLEX_TOKEN, token); 
};

PLEX.prototype.getServerToken = function() {
  return localStorage.getItem(this.LG_PLEX_TOKEN);    
};

PLEX.prototype.getServerPort = function() {
	return localStorage.getItem(this.LG_PLEX_SERVER).substr(localStorage.getItem(this.LG_PLEX_SERVER).lastIndexOf(":")+1);    
};

PLEX.prototype.removeServerUrl = function() {
	localStorage.removeItem(this.LG_PLEX_SERVER);    
};

PLEX.prototype.urlWithOptions = function(path = '', options = {}) {
  var url = this.getServerUrl() + path,
      query = this.getServerToken() ? ['X-Plex-Token=' + this.getServerToken()] : [];

  for(var option in options) {
    query.push(encodeURIComponent(option) + "=" + encodeURIComponent(options[option]))
  }

	url + '?' + query.join('&');
};

PLEX.prototype.getLibraryServer = function(callback) {
  $.get(this.urlWithOptions(), callback);
};

PLEX.prototype.checkLibraryServerExists = function(callback, failCallback) {
	$.ajax({url: this.urlWithOptions(), 
		success: callback,
		error: failCallback,
		timeout: 20000
	});
};

PLEX.prototype.scanNetwork = function(ip, callback, failCallback, completedCallback) {
	var url = "";
	
	for (i = 0; i <= 255; i++) {
		url = "http://" + ip.substr(0, ip.lastIndexOf(".")+1) + i.toString() + ":32400";
		$.ajax({url: url, 
			success: callback,
			error: failCallback,
			complete: completedCallback,
			timeout: 20000
		});	
	}
};

PLEX.prototype.getMediaType = function(title, sectionType) {
	switch(sectionType) {
	 	case "movie":
			if (title.indexOf("Home") > -1) {
				return "home";
			}
			break;
	}
	
	return sectionType;
};

// Media library functions 
PLEX.prototype.getPlaylists = function (sortFormatted, callback) {
  var path = '/playlists/all',
      options = {};

  if (sortFormatted != "none") options['sort'] = sortFormatted;

  this.urlWithOptions(path, options);
};

PLEX.prototype.removeHiddenToken = function (title) {
    return title.replace('[p]', '').replace('[P]','');
}

PLEX.prototype.isTreeContainsHiddenFiles = function(item, filter)
{
    var containsHiddenContent = false;
    var self = this;

    if (filter == "search") { //need to check if parent directory of the item is hidden
        $.ajax({
            type: "GET",
            url: self.getServerUrl() + $(item).attr("key"),
            dataType: "xml",
            async: false,
            success: function (data) {
                $(data).find("MediaContainer").each(function (index, item) {
                    containsHiddenContent = self.isMarkedAsHidden(item, "librarySectionTitle"); //check if the original section it was is marked as hidden
                    if (containsHiddenContent) {
                        return true;
                    }
                });
            }
        });
    } else {
        // this function for now only checks playlists
        if ($(item).attr("type") != "playlist") {
            return false;
        }



        $.ajax({
            type: "GET",
            url: self.getServerUrl() + $(item).attr("key"),
            dataType: "xml",
            async: false,
            success: function (data) {
                $(data).find("Video").each(function (index, item) {
                    if (!containsHiddenContent) //once true it stays true
                    {
                        containsHiddenContent = "bla3";
                        $.ajax({
                            type: "GET",
                            url: self.getServerUrl() + $(item).attr("key"),
                            dataType: "xml",
                            async: false,
                            success: function (data2) {

                                $(data2).find("MediaContainer").each(function (index, item) {
                                    containsHiddenContent = self.isMarkedAsHidden(item, "librarySectionTitle"); //check if the original section it was is marked as hidden
                                    if (containsHiddenContent) {
                                        return true;
                                    }
                                });

                                if (!containsHiddenContent) {
                                    $(data2).find("Video").each(function (index, item) { // check if the file itself is hidden
                                        containsHiddenContent = self.isMarkedAsHidden(item, "title"); //check if the original section it was is marked as hidden
                                        if (containsHiddenContent) {
                                            return true;
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });

    }
	
	
    return containsHiddenContent;
};

PLEX.prototype.getSections = function(callback) {
  var path = "/library/sections";

	$.get(this.urlWithOptions(path), callback);
};

PLEX.prototype.getSectionDetails = function(key, callback) {
  var path = "/library/sections" + key;

  $.get(this.urlWithOptions(path), callback);
};

PLEX.prototype.getSectionFilterOptions = function (section, key, callback) {
  if (section != "playlists" && section != "channels") {
    var path = "/library/sections/" + key + "/filters";

    $.get(this.urlWithOptions(path), callback);
  }
}

PLEX.prototype.getSectionSortOptions = function (section, key, callback) {
  var path = null;

  if (section == "playlists")
  {
    path = "/playlists/sorts";
  } else if (section != "channels")  {
    path = "/library/sections/" + key + "/sorts";
  }

  if(path) $.get(this.urlWithOptions(path), callback);
}


PLEX.prototype.getSectionMedia = function(section, key, view, viewKey, sort, callback, options) {
	var jsonCallback = 'callback' + new Date().getTime();
	var self = this;
	var page = "";

    options = options || {};
    
    var start = options.start || -1;
    var size = options.size  || -1;

	if (typeof options.start !== 'undefined' & typeof options.size !== 'undefined') { 
		page = "&X-Plex-Container-Start=" + options.start + "&X-Plex-Container-Size=" + options.size;	
	}

	if (viewKey) {
		switch(view) {
			case "folder": 
			case "all": 
				view = decodeURIComponent(viewKey);
				if (view.indexOf("?") > -1) {
					$.get(this.getServerUrl() + view + "&X-Plex-Access-Time=" + this.time + page, callback);
				} else {
					$.get(this.getServerUrl() + view + "?X-Plex-Access-Time=" + this.time + page, callback);
				}
				break;

			case "search": 
				$.get(this.getServerUrl() + "/search?query=" + viewKey + page , callback);
				break;
								
			default:
				$.get(this.getServerUrl() + "/library/sections/" + key + "/" + view + "/" + viewKey + "?X-Plex-Access-Time=" + this.time + page, callback);		
				break;
		}
	} else {
	    switch(section) {
	        case "channels":
	            if (key == "channels") {
	                self.getChannels(key, callback);
	            } else {
	                $.get(this.getServerUrl() + key, callback);
	            }
	            break;
	        case "playlists":
	            if (key == "playlists") {
	                self.getPlaylists(sort, callback);
	            } else {
	                $.get(this.getServerUrl() + "/playlists/" + key + "/items/", callback);
                }
	            
	            break;
	        default:
	            $.get(this.getServerUrl() + "/library/sections/" + key + "/" + view + "?" + (sort != "none" ? "sort=" + sort + "&" : "") + "X-Plex-Access-Time=" + this.time + page, callback);
	            break;
	    }
	}
};

PLEX.prototype.getRecentlyAdded = function(key, callback) {
  var path = "/library/sections/" + key + "/recentlyAdded",
      options = { "X-Plex-Container-Start": 0, "X-Plex-Container-Size": 25 };

	$.get(this.urlWithOptions(path, options), callback);
};

PLEX.prototype.getOnDeck = function(key, callback) {
  var path = "/library/onDeck",
      options = { "X-Plex-Container-Start": 0, "X-Plex-Container-Size": 25 };

	$.get(this.urlWithOptions(path, options), callback);
};

PLEX.prototype.getChannels = function(key, callback) {
  var path = "/channels/all";

  $.get(this.urlWithOptions(path), callback);
};

//Helper function for main menu
PLEX.prototype.getMediaItems = function(section, key, callback) {
	switch (section) {
		case "ondeck": 
			this.getOnDeck(key, callback);
			break;
		
		case "channels":
			this.getChannels(key, callback);
			break;
		
	    	case "playlists":
	        	break;

		default:
			this.getRecentlyAdded(key, callback);
			break;
	}
};

PLEX.prototype.getMediaMetadata = function(key, callback) {
	if (key.indexOf("?") > -1) {
		$.get(this.getServerUrl() + key + "&X-Plex-Access-Time=" + this.time, callback);
	} else {
		$.get(this.getServerUrl() + key + "?X-Plex-Access-Time=" + this.time, callback);
	}
};

PLEX.prototype.reportProgress = function(key, state, time) {
  var path = "/:/progress",
      options = { key: key, identifier: "com.plexapp.plugins.library", time: Math.round(time), state: state };

  $.get(this.urlWithOptions(path, options), callback);
};

PLEX.prototype.setWatched = function(key, callback) {
  var path = "/:/scrobble",
      options = { key: key, identifier: "com.plexapp.plugins.library" };

  $.get(this.urlWithOptions(path, options), callback);
};

PLEX.prototype.setUnwatched = function(key, callback) {
  var path = "/:/unscrobble",
      options = { key: key, identifier: "com.plexapp.plugins.library" };

  $.get(this.urlWithOptions(path, options), callback);
};

PLEX.prototype.setAudioStream = function(partKey, streamKey) {
  var path = "/library/parts/" + partKey,
      options = { audioStreamID: streamKey };

	$.ajax({
		type: "PUT",
		url: this.urlWithOptions(path, options)
	});
};

PLEX.prototype.setSubtitleStream = function(partKey, streamKey) {
  var path = "/library/parts/" + partKey,
      options = { subtitleStreamID: streamKey };

  $.ajax({
    type: "PUT",
    url: this.urlWithOptions(path, options)
  });
};

PLEX.prototype.getTranscodedPath = function(path, width, height, remote) {
  var path = "/photo/:/transcode",
      options = { width: width, height: height, url: encodeURIComponent("http://localhost:" + this.getServerPort() + path) };

	if (remote) options.url = encodeURIComponent(path);

  return this.urlWithOptions(path, options);
};

PLEX.prototype.getTranscodedMediaFlagPath = function(flag, value, width, height) {
  var path = "/photo/:/transcode",
      options = { width: width, height: height, url: encodeURIComponent("http://localhost:" + this.getServerPort() + "/system/bundle/media/flags/" + flag + "/" + value + "?t=" + new Date().getTime()) };
	
  return this.urlWithOptions(path, options);
};

// HTML output functions
PLEX.prototype.getThumbHtml = function(index, title, sectionType, mediaType, key, metadata) {
	var html = "";
	var biggerClass = "";	
	var width = 128;
	var height = 190;
	
	if (sectionType && sectionType.indexOf("home") > -1) {
		mediaType = "home";
	}
	
	var bigger = localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "smallPicutres") != "1";
		
	if (bigger && sectionType.indexOf('recent') == '-1') {
		width = 180;
		height = 270;
		biggerClass = "bigger ";
	}
	
	switch(mediaType) {	
		case "movie":
			html = "<li class=\"media " + biggerClass + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" data-media=\"" + metadata.media + "\" href>";
			html += "<div class=\"thumb " + biggerClass + "\" data-original=\"" + this.getTranscodedPath(metadata.thumb, width, height) + "\"></div>";	
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "titleOverlay") != "1"){html += "<div class=\"subtitle alt\">" + title + "</div>";};
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "watchedIcons") != "1") {
				html += "<div class=\"watchedStatus\">" + this.getWatchedIconHtml(metadata.lastViewedAt, metadata.viewOffset, metadata.viewCount, metadata.duration) + "</div>";
			}
			html += "</a></li>";
			break;

		case "photo":	
			if (metadata.media) {
				html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" data-media=\"" + metadata.media + "\" href>";
			} else {
				html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"folder\" data-art=\"" + metadata.art + "\" data-media=\"" + metadata.media + "\" data-filter=\"" + metadata.filter + "\" href>";
			}
			html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 300, 190) + "\"></div>";	
			html += "<div class=\"subtitle alt\">" + title + "</div>";
			html += "</a></li>";			
			break;

		case "home":	
			html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" data-media=\"" + metadata.media + "\" href>";
			html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 190, 190) + "\"></div>";	
			html += "<div class=\"subtitle alt\">" + title + "</div>";				
			html += "</a></li>";	
			break;

		case "episode":		
			html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" data-media=\"" + metadata.media + "\" href>";
			if (sectionType && sectionType.indexOf("recent") > -1) {
				html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.grandparentThumb, 300, 190) + "\"></div>";
			} else {
				html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 300, 190) + "\"></div>";
			}
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "titleOverlay") != "1"){if (metadata.series) {html += "<div class=\"title\">" + metadata.series + "</div>";};};
			html += "<div class=\"subtitle alt\">" + (metadata.season ? metadata.season + "." : "") + metadata.episode + " " + title + "</div>";
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "watchedIcons") != "1") {
				html += "<div class=\"watchedStatus\">" + this.getWatchedIconHtml(metadata.lastViewedAt, metadata.viewOffset, metadata.viewCount, metadata.duration) + "</div>";	
			}
			html += "</a></li>";	
			break;

		case "show":			
			html = "<li class=\"media " + biggerClass + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" href>";
			html += "<div class=\"thumb " + biggerClass + "\" data-original=\"" + this.getTranscodedPath(metadata.thumb, width, height) + "\"></div>";
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "titleOverlay") != "1") {html += "<div class=\"subtitle alt\">" + title + "</div>";};	
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "watchedIcons") != "1") {
				html += "<div class=\"watchedStatus unwatched-count-badge badge badge-lg\">" + (Number(metadata.leafCount) - Number(metadata.viewedLeafCount)) + "</div>";	
			}			
			html += "</a></li>";	
			break;

		case "artist":
			html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" href>";
			html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 190, 190) + "\"></div>";
			html += "<div class=\"subtitle alt\">" + title + "</div>";			
			html += "</a></li>";	
			break;
	
		case "channel":
			html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" href>";
			html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 128, 190, true) + "\"></div>";
			html += "<div class=\"subtitle alt\">" + title + "</div>";			
			html += "</a></li>";	
			break;			
	    	case "playlist":
	        	html = "<li class=\"media " + biggerClass + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" href>";
		        html += "<div class=\"thumb " + biggerClass + "\" data-original=\"" + this.getTranscodedPath(metadata.thumb, width, height, true) + "\"></div>";
		        html += "<div class=\"subtitle alt\">" + title + "</div>";
		        html += "</a></li>";
		        break;

	    	case "album":
			html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-parent-key=\"" + metadata.parentKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" href>";
			html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 190, 190) + "\"></div>";
			if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "titleOverlay") != "1"){if (metadata.artist) {html += "<div class=\"title\">" + metadata.artist + "</div>";};};
			html += "<div class=\"subtitle alt\">" + title + "</div>";			
			html += "</a></li>";	
			break;

		case "track":				
			html = "<li class=\"" + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-media=\"" + metadata.media + "\" data-duration=\"" + metadata.duration + "\" href>";
			html += "<div class=\"track-title\"><i class=\"glyphicon\"></i>" + metadata.index + ". " + title + "</div>";			
			html += "</a></li>";	
			break;
	    	case "clip":
	        
		        html = "<li class=\"media " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-art=\"" + metadata.art + "\" data-media=\"" + metadata.media + "\" href>";
		        html += "<div class=\"thumb\" data-original=\"" + this.getTranscodedPath(metadata.thumb, 128, 190) + "\"></div>";
		        if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "titleOverlay") != "1") { html += "<div class=\"subtitle alt\">" + title + "</div>"; };
		        if (localStorage.getItem(this.PLEX_OPTIONS_PREFIX + "watchedIcons") != "1") {
		            html += "<div class=\"watchedStatus\">" + this.getWatchedIconHtml(metadata.lastViewedAt, metadata.viewOffset, metadata.viewCount, metadata.duration) + "</div>";
		        }
		        html += "</a></li>";
		        break;

		default:				
			html = "<li class=\"media " + metadata.filter + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\"";
			html += " data-key=\"" + key + "\" data-section-type=\"" + sectionType + "\" data-section-key=\"" + metadata.sectionKey + "\" data-media-type=\"folder\" data-filter=\"" + metadata.filter + "\" href>";
			html += "<div class=\"thumb\" data-original=\"./system/images/folder.png\"></div>";
			html += "<div class=\"subtitle\">" + title + "</div>";			
			html += "</a></li>";	
			break;
			
	}
	return html;
};

PLEX.prototype.getListHtml = function(index, title, sectionType, mediaType, key, metadata) {
	var html = "";
	if (sectionType && sectionType.indexOf("home") > -1) {
		mediaType = "home";
	}
		
	switch(mediaType) {	
		case "movie":
		case "photo":	
		case "home":	
		case "episode":		
		case "show":			
		case "artist":
		case "album":				
	    	case "playlist":
			html = "<li class=\"list " + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-parent-key=\"" + metadata.parentKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" href>";
			html += "<span class=\"listTitle\">" + title + "</div>";
			if (metadata.year) {
				html += "<span class=\"listYear\">" + metadata.year + this.getWatchedIconHtml(metadata.lastViewedAt, metadata.viewOffset, metadata.viewCount, metadata.duration) + "</div>";
			}
			html += "</a></li>";	
			break;

		case "track":				
			html = "<li class=\"" + mediaType + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\" data-key=\"" + key + "\" data-section-key=\"" + metadata.sectionKey + "\" data-section-type=\"" + sectionType + "\" data-media-type=\"" + mediaType + "\" data-media=\"" + metadata.media + "\" href>";
			html += "<div class=\"track-title\"><i class=\"glyphicon\"></i>" + metadata.index + ". " + title + "</div>";			
			html += "</a></li>";	
			break;

		default:				
			html = "<li class=\"list " + metadata.filter + "\"><a data-key-index=\"" + index + "\" data-title=\"" + title + "\"";
			html += " data-key=\"" + key + "\" data-section-type=\"" + sectionType + "\" data-section-key=\"" + metadata.sectionKey + "\" data-media-type=\"folder\" data-filter=\"" + metadata.filter + "\" href>";
			html += "<span class=\"title\">" + title + "</div>";			
			html += "</a></li>";	
			break;
			
	}
	return html;
};

PLEX.prototype.getMediaHtml = function(title, mediaType, metadata) {
	var html = "<div class=\"" + mediaType + "\">";
	
	switch(mediaType) {	
		case "movie":
			html += "<div class=\"thumb\" style=\"background-image: url('" + this.getTranscodedPath(metadata.art, 350, 350) + "')\"></div>";
			html += "<div class=\"title\">" + title + "</div>";
			if (metadata.year) { 
				html += "<div class=\"time\"><span class=\"duration\">" + this.getTimeFromMS(metadata.duration);
				html += this.getWatchedIconHtml(metadata.lastViewedAt, metadata.viewOffset, metadata.viewCount, metadata.duration); 
				html += "</span><span class=\"year\">" + metadata.year + "</span></div>"; 
			}				
			if (metadata.tagline) { html += "<div class=\"tagline\">" + metadata.tagline + "</div>"; }
			if (metadata.summary) { html += "<div class=\"summary\">" + metadata.summary + "</div>"; }
			if (metadata.roles && metadata.roles.length > 0) { html += "<div class=\"roles\">" + metadata.roles.join(", ") + "</div>"; }
			if (metadata.genre && metadata.genre.length > 0) { html += "<div class=\"genre\">" + metadata.genre.join(", ") + "</div>"; }
			if (metadata.director) { html += "<div class=\"director\">" + metadata.director + "</div>"; }
			if (metadata.width) { html += "<div class=\"resolution\">" + metadata.width + "x" + metadata.height + "</div>"; }

			if (metadata.studio) { html += "<div class=\"studio\"><img src=\"" + this.getTranscodedMediaFlagPath("studio", metadata.studio, 150, 40) + "\"/></div>"; }
			if (metadata.contentRating) { html += "<div class=\"contentRating\"><img src=\"" + this.getTranscodedMediaFlagPath("contentRating", metadata.contentRating, 80, 40) + "\"/></div>"; }	
			break;

		case "photo":	
			html = "<div class=\"thumb\" style=\"background-image: url('" + this.getTranscodedPath(metadata.thumb, 350, 350) + "')\"></div>";	
			html += "<div class=\"title\">" + title + "</div>";	
			if (metadata.year) { html += "<div class=\"time\">" + metadata.year + "</div>"; }				
			if (metadata.summary) { html += "<div class=\"summary\">" + metadata.summary + "</div>"; }	
			html += "<div class=\"dimensions\">";						
			if (metadata.width) { html += "<span class=\"width\">" + metadata.width + "</span>"; }
			if (metadata.height) { html += "<span class=\"height\">" + metadata.height + "</span>"; }
			html += "</div>";
			if (metadata.container) { html += "<div class=\"container\">" + metadata.container + "</div>"; }		
			break;

		case "home":
			html = "<div class=\"thumb\" style=\"background-image: url('" + this.getTranscodedPath(metadata.art, 350, 350) + "')\"></div>";
			html += "<div class=\"title\">" + title + "</div>";						
			break;

		case "episode":		
		case "show":			
			html = "<div class=\"thumb\" style=\"background-image: url('" + this.getTranscodedPath(metadata.thumb, 350, 350) + "')\"></div>";
			html += "<div class=\"title\">" + title+ "</div>"; 
			html += "<div class=\"subtitle\">";
			if (metadata.parentIndex) { html += "<span class=\"season-n\">" + metadata.parentIndex+ "</span>"; }
			if (metadata.index) { html += "<span class=\"episode-n\">" + metadata.index+ "</span>"; } 
			html += "</div>";	
			if (metadata.grandparentTitle) { html += "<div class=\"tagline\">" + metadata.grandparentTitle+ "</div>"; }
			if (metadata.year) { html += "<div class=\"time\">" + metadata.year + this.getWatchedIconHtml(metadata.lastViewedAt, metadata.viewOffset, metadata.viewCount, metadata.duration) + "</div>"; }				
			if (metadata.summary) { html += "<div class=\"summary\">" + metadata.summary + "</div>"; }
			if (metadata.contentRating) { html += "<div class=\"contentRating\"><img src=\"" + this.getTranscodedMediaFlagPath("contentRating", metadata.contentRating, 80, 40) + "\"/></div>"; }
			if (metadata.width) { html += "<div class=\"resolution\">" + metadata.width + "x" + metadata.height + "</div>"; }
			//if (metadata.parentThumb) { html += "<div class=\"cover\"><img src=\"" + this.getTranscodedPath(metadata.parentThumb, 150, 150) + "\"/></div>"; }						
			break;

		case "artist":	
		case "album":				
			html = "<div class=\"thumb\" style=\"background-image: url('" + this.getTranscodedPath(metadata.art, 350, 350) + "')\"></div>";
			html += "<div class=\"title\">" + title + "</div>";	
			if (metadata.year) { html += "<div class=\"time\">" + metadata.year + "</div>"; }				
			if (metadata.artist) { html += "<div class=\"artist\">" + metadata.artist + "</div>"; }
			if (metadata.tracks.length > 0) { html += "<div class=\"summary\">" + metadata.tracks.join("<br/>") + "</div>"; }		
			if (metadata.thumb) { html += "<div class=\"cover\"><img src=\"" + this.getTranscodedPath(metadata.thumb, 100, 100) + "\"/></div>"; }		
			break;
	}
	
	html += "</div>";
	
	return html;
};

PLEX.prototype.getMediaPreviewHtml = function(xml) {
	var mediaItem = $(xml).find("MediaContainer:first").children().first();
	var mediaItemFile = mediaItem.find("Media:first");	
	var mediaType = mediaItem.attr("type");	
	var audioStream = $(xml).find("Media:first Stream[streamType='2'][selected='1']").length > 0 ? $(xml).find("Media:first Stream[streamType='2'][selected='1']") : $(xml).find("Media:first Stream[streamType='2']:first");
	var subtitleStream = $(xml).find("Media:first Stream[streamType='3'][selected='1']").length > 0 ? $(xml).find("Media:first Stream[streamType='3'][selected='1']") : $(xml).find("Media:first Stream[streamType='3']");	
	
	var html = "<div class=\"" + mediaType + "\">";
	var remote = false;
	switch (mediaType) {
	    case "clip":
	        remote = true;
		case "movie":
			html += "<div class=\"leftColumn\">";
			html += "<div class=\"cover\" style=\"background-image: url('" + this.getTranscodedPath(mediaItem.attr("thumb"), 300, 440, remote) + "')\"></div>";

			html += "<div class=\"media\">";
			if (mediaItemFile.attr("videoResolution")) { html += "<img src=\"" + this.getTranscodedMediaFlagPath("videoResolution", mediaItemFile.attr("videoResolution"), 100, 20) + "\"/>"; } 
			if (mediaItemFile.attr("audioCodec")) { html += "<img src=\"" + this.getTranscodedMediaFlagPath("audioCodec", mediaItemFile.attr("audioCodec"), 100, 20) + "\"/>"; }
			if (mediaItemFile.attr("audioChannels")) { html += "<img src=\"" + this.getTranscodedMediaFlagPath("audioChannels", mediaItemFile.attr("audioChannels"), 100, 20) + "\"/>"; }
			html += "</div>";

			html += "</div>";
			
			html += "<div class=\"rightColumn\">";
			
			html += "<div class=\"title\">" + mediaItem.attr("title") + "</div>";
						
			html += "<div class=\"time\">";
			if (mediaItem.attr("duration")) { 
				html += "<span class=\"duration\">" + this.getTimeFromMS(mediaItem.attr("duration"));
				html += this.getWatchedIconHtml(mediaItem.attr("lastViewedAt"), mediaItem.attr("viewOffset"), mediaItem.attr("viewCount"), mediaItem.attr("duration")); 
				html += "</span>";
			}
			if (mediaItem.attr("year")) { html += "<span class=\"year\">" + mediaItem.attr("year") + "</span>"; }
			html += "</div>"; 
			
			if (mediaItem.attr("tagline")) { html += "<div class=\"tagline\">" + mediaItem.attr("tagline") + "</div>"; }
			if (mediaItem.attr("summary")) { html += "<div class=\"summary\">" + mediaItem.attr("summary") + "</div>"; }
			
			if (mediaItem.find("Genre").length > 0) { html += "<div class=\"genre\">" + this.getAttributeList(mediaItem.find("Genre"), "tag", ", ") + "</div>"; }						
			if (mediaItem.find("Director").length > 0) { html += "<div class=\"director\">" + mediaItem.find("Director").attr("tag") + "</div>"; }
			if (mediaItem.find("Role").length > 0) { html += "<div class=\"roles\">" + this.getAttributeList(mediaItem.find("Role"), "tag", ", ") + "</div>"; }
			
			if (audioStream.length > 0) { html += "<div class=\"audio\">" + (audioStream.attr("language") || "Unknown") + " (" + audioStream.attr("codec") + ")</div>"; }
			if (subtitleStream.length > 0) { 
				if (subtitleStream.length == 1) { 
					html += "<div class=\"subtitles\">" + subtitleStream.attr("language") + " (" + subtitleStream.attr("format") +")</div>"; 
				} else {
					html += "<div class=\"subtitles\">Disabled</div>";
				}
			}			
			if (mediaItemFile.attr("width")) { html += "<div class=\"resolution\">" + mediaItemFile.attr("width") + "x" + mediaItemFile.attr("height") + "</div>"; }
			
			if (mediaItem.attr("studio")) { html += "<div class=\"studio\"><img src=\"" + this.getTranscodedMediaFlagPath("studio", mediaItem.attr("studio"), 300, 40) + "\"/></div>"; }
			if (mediaItem.attr("contentRating")) { html += "<div class=\"contentRating\"><img src=\"" + this.getTranscodedMediaFlagPath("contentRating", mediaItem.attr("contentRating"), 70, 25) + "\"/></div>"; }	
			
			html += "</div>";
			break;

		case "photo":
			html += "<div class=\"leftColumn\">";
			html += "<div class=\"title\">" + (mediaItem.attr("parentTitle") ? mediaItem.attr("parentTitle") + "/":"") + mediaItem.attr("title") + "</div>";				
			if (mediaItem.attr("year")) { html += "<div class=\"time\"><div class=\"year\">" + mediaItem.attr("year") + "</div></div>"; }
			if (mediaItem.attr("summary")) { html += "<div class=\"summary\">" + mediaItem.attr("summary") + "</div>"; }			
			if (mediaItemFile.attr("width")) { html += "<div class=\"dimensions\"><span class=\"width\">" + mediaItemFile.attr("width") + "</span></div>"; } 
			if (mediaItemFile.attr("height")) { html += "<div class=\"dimensions\"><span class=\"height\">" + mediaItemFile.attr("height") + "</span></div>"; }
			if (mediaItemFile.attr("container")) { html += "<div class=\"container\">" + mediaItemFile.attr("container") + "</div>"; }
			html += "</div>";
			
			html += "<div class=\"rightColumn\">";								
			html += "<div class=\"cover\">";
			html += "<img class=\"photo\" src=\"" + this.getTranscodedPath(mediaItem.find("Part").attr("key"), 800, 600) + "\"/>";
			html += "</div>";
			html += "</div>";
			break;
			
		case "album":
			html += "<div class=\"leftColumn\">";
			html += "<div class=\"cover\" style=\"background-image: url('" + this.getTranscodedPath(mediaItem.attr("thumb"), 320, 320) + "')\"></div>";
			html += "<div class=\"title\">" + mediaItem.attr("title") + "</div>";
			html += "<div class=\"time\">";
			if (mediaItem.attr("year")) { html += "<span class=\"year\">" + mediaItem.attr("year") + "</span>"; }
			html += "</div>"; 
			
			if (mediaItem.attr("summary")) { html += "<div class=\"summary\">" + mediaItem.attr("summary") + "</div>"; }
			if (mediaItem.find("Genre").length > 0) { html += "<div class=\"genre\">" + this.getAttributeList(mediaItem.find("Genre"), "tag", ", ") + "</div>"; }			
			html += "</div>";

			html += "<div class=\"rightColumn\">";	
			html += "<div id=\"children\"><ul></ul></div>";								
			html += "</div>";			
			break;

		case "artist":
			html += "<div class=\"leftColumn\">";
			html += "<div class=\"cover\" style=\"background-image: url('" + this.getTranscodedPath(mediaItem.attr("thumb"), 380, 380) + "')\"></div>";
			html += "<div class=\"title\">" + mediaItem.attr("title") + "</div>";						
			if (mediaItem.find("Genre").length > 0) { html += "<div class=\"genre\">" + this.getAttributeList(mediaItem.find("Genre"), "tag", ", ") + "</div>"; }				
			if (mediaItem.attr("summary")) { html += "<div class=\"summary\">" + mediaItem.attr("summary") + "</div>"; }			
			html += "</div>";
			
			html += "<div class=\"rightColumn\">";
			html += "<div id=\"children\"><ul></ul></div>";								
			html += "</div>";			
			break;

		case "show":
		case "season":		
			html += "<div class=\"leftColumn\">";
			html += "<div class=\"cover\" style=\"background-image: url('" + this.getTranscodedPath(mediaItem.attr("thumb"), 300, 440) + "')\"></div>";
			if (mediaItem.attr("parentTitle")) { html += "<div class=\"title\">" + mediaItem.attr("parentTitle") + "</div>"; }
			html += "<div class=\"title\">" + mediaItem.attr("title") + "</div>";
			html += "<div class=\"time\">";
			if (mediaItem.attr("duration")) { html += "<span class=\"duration\">" + this.getTimeFromMS(mediaItem.attr("duration")) + "</span>"; }
			if (mediaItem.attr("year")) { html += "<span class=\"year\">" + mediaItem.attr("year") + "</span>"; }
			html += "</div>"; 
			if (mediaItem.find("Genre").length > 0) { html += "<div class=\"genre\">" + this.getAttributeList(mediaItem.find("Genre"), "tag", ", ") + "</div>"; }			
			if (mediaItem.attr("summary")) { html += "<div class=\"summary\">" + mediaItem.attr("summary") + "</div>"; }				
			html += "</div>";
			
			html += "<div class=\"rightColumn\">";
			html += "<div id=\"children\"><ul></ul></div>";	
			if (mediaItem.attr("theme")) { html += "<div id=\"theme\" data-src=\"" + this.getServerUrl() + mediaItem.attr("theme") + "\"></div>" };											
			html += "</div>";			
			break;

		case "episode":
			html += "<div class=\"leftColumn\">";
			html += "<div class=\"cover\" style=\"background-image: url('" + this.getTranscodedPath(mediaItem.attr("thumb"), 380, 256) + "')\"></div>";
			html += "<div class=\"media\">";
			if (mediaItemFile.attr("videoResolution")) { html += "<img src=\"" + this.getTranscodedMediaFlagPath("videoResolution", mediaItemFile.attr("videoResolution"), 100, 20) + "\"/>"; } 
			if (mediaItemFile.attr("audioCodec")) { html += "<img src=\"" + this.getTranscodedMediaFlagPath("audioCodec", mediaItemFile.attr("audioCodec"), 100, 20) + "\"/>"; }
			if (mediaItemFile.attr("audioChannels")) { html += "<img src=\"" + this.getTranscodedMediaFlagPath("audioChannels", mediaItemFile.attr("audioChannels"), 100, 20) + "\"/>"; }
			html += "</div>";			
			html += "</div>";
			
			html += "<div class=\"rightColumn\">";
			html += "<div class=\"title\">" + mediaItem.attr("title") + "</div>";
			html += "<div class=\"time\">";
			if (mediaItem.attr("duration")) { 
				html += "<span class=\"duration\">" + this.getTimeFromMS(mediaItem.attr("duration"));
				html += this.getWatchedIconHtml(mediaItem.attr("lastViewedAt"), mediaItem.attr("viewOffset"), mediaItem.attr("viewCount"), mediaItem.attr("duration")); 
				html += "</span>";
			}
			if (mediaItem.attr("year")) { html += "<span class=\"year\">" + mediaItem.attr("year") + "</span>"; }
			html += "</div>"; 
			
			if (mediaItem.attr("summary")) { html += "<div class=\"summary\">" + mediaItem.attr("summary") + "</div>"; }	
			
			if (mediaItem.find("Genre").length > 0) { html += "<div class=\"genre\">" + this.getAttributeList(mediaItem.find("Genre"), "tag", ", ") + "</div>"; }						
			if (mediaItem.find("Role").length > 0) { html += "<div class=\"roles\">" + this.getAttributeList(mediaItem.find("Role"), "tag", ", ") + "</div>"; }	
			if (mediaItem.find("Writer").length > 0) { html += "<div class=\"writer\">" + this.getAttributeList(mediaItem.find("Writer"), "tag", ", ") + "</div>"; }
			if (mediaItem.find("Director").length > 0) { html += "<div class=\"director\">" + this.getAttributeList(mediaItem.find("Director"), "tag", ", ") + "</div>"; }	
			
			if (audioStream.length > 0) { html += "<div class=\"audio\">" + (audioStream.attr("language") || "Unknown") + " (" + audioStream.attr("codec") + ")</div>"; }
			if (subtitleStream.length > 0) { 
				if (subtitleStream.length == 1) { 
					html += "<div class=\"subtitles\">" + subtitleStream.attr("language") + " (" + subtitleStream.attr("format") +")</div>"; 
				} else {
					html += "<div class=\"subtitles\">Disabled</div>";
				}
			}	
			if (mediaItemFile.attr("width")) { html += "<div class=\"resolution\">" + mediaItemFile.attr("width") + "x" + mediaItemFile.attr("height") + "</div>"; }
			html += "</div>";			
			break;
			
		default:
		
			break;
	}
	
	html += "</div>";
	
	return html;
};

PLEX.prototype.getWatchedIconHtml = function(lastViewedAt, viewOffset, viewCount, duration)
{		
	if (viewCount) {	
		return "<span id=\"watchStatus\" class=\"\"></span>";
	}
	
	if (viewOffset) {
		if (viewOffset/duration > 0.9) {
			return "<span id=\"watchStatus\" class=\"\"></span>";
		} else {
			return "<span id=\"watchStatus\" class=\"unwatched-icon unwatched-partial-icon\"></span>"; 	
		}
	}
	
	return "<span id=\"watchStatus\" class=\"unwatched-icon unwatched-full-icon\"></span>"; 
};

PLEX.prototype.getAttributeList = function(nodeList, attribute, join)
{
	var list = [];
	nodeList.each(function() { list.push($(this).attr(attribute)) });
	return list.join(join);
};

PLEX.prototype.getTimeFromMS = function(duration) {
	if (!duration) {
		return "";
	}
	
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
};


// Transcoding

PLEX.prototype.getGenericTranscodeUrl = function(key, partKey, options) {
    options = options || {};

    var offset  = options.offset  || 0;
    var quality = options.quality || 7;
    var format = options.format || 'mpegts';
    var audioCodec = options.audioCodec || 'libfaac'; // AAC: libfaac, MP3: libmp3lame
    var audioBitrate = options.audioBitrate || 128;
    var videoCodec = options.videoCodec || 'libx264'; // H.264: libx264
    var videoBitrate = options.videoBitrate || 3000;

    var path = '/video/:/transcode/generic.'+format,
        options = {
                    identifier: encodeURIComponent('com.plexapp.plugins.library'),
                    format: format,
                    videoCodec: videoCodec,
                    videoBitrate: videoBitrate,
                    audioCodec: audioCodec,
                    audioBitrate: audioBitrate,
                    size: '1280x720',
                    width: '1280',
                    height: '720',
                    quality: quality,
                    fakeContentLength: '2000000000',
                    offset: offset,
                    key: encodeURIComponent('http://127.0.0.1:' + this.getServerPort() + key),
                    url: encodeURIComponent('http://127.0.0.1:' + this.getServerPort() + partKey)
                  }

    return this.urlWithOptions(path, options);
};

PLEX.prototype.getHlsTranscodeUrl = function(key, options) {	
	options = options || {};
	
	var path = "http://127.0.0.1:32400" + key;
	var session = localStorage.getItem(this.PLEX_SESSION_ID);
	var mediaIndex = options.mediaIndex || "0";
	var partIndex = options.partIndex || "0";
	var protocol = options.protocol || "http";
	var offset = options.offset || "0";
	var fastSeek = options.fastSeek || "1";
	var directPlay = options.directPlay || "0";
	var directStream = options.directStream || "1";
	var maxVideoBitrate = options.maxVideoBitrate || "3000";
	var subtitleSize = options.subtitleSize || "90";
	var videoQuality = options.videoQuality || "100";
	var audioBoost = options.audioBoost || "100";
	var videoResolution = options.videoResolution || "1920x1080";
	var burn = options.burnSubtitles || "burn";
	var copyts = options.copyTs || "1";
	var acceptLanguage = options.acceptLanguage || "en";

	var path = "/video/:/transcode/universal/start",
      options = {
                	path: encodeURIComponent(path),
                	mediaIndex: mediaIndex,
                	partIndex: partIndex,
                	protocol: protocol,
                	offset: offset,
                	fastSeek: fastSeek,
                	directPlay: directPlay,
                	directStream: directStream,
                	videoQuality: videoQuality;,
                	audioBoost: audioBoost,
                	maxVideoBitrate: maxVideoBitrate,
                	subtitleSize: subtitleSize,
                	videoResolution: videoResolution;,
                	videoQuality: videoQuality;,
                	session: session,
                	subtitles: burn,
                	copyts: copyts,
                	"Accept-Language": acceptLanguage,
                	"X-Plex-Client-Identifier": this.X_Plex_Client_Identifier,
                	"X-Plex-Product": this.X_Plex_Product,
                	"X-Plex-Device": this.X_Plex_Device,
                	"X-Plex-Platform": this.X_Plex_Platform,
                	"X-Plex-Platform-Version": this.X_Plex_Platform_Version,
                	"X-Plex-Version": this.X_Plex_Version,
                	"X-Plex-Device-Name": this.X_Plex_Device_Name
                }
	
	return this.urlWithOptions(path, options);
};

PLEX.prototype.getTimeline = function(key, state, time, duration) {
  var path = "/:/timeline",
      options = { time: time, duration: duration, state: state, key: "%2Flibrary%2Fmetadata%2F" + key, ratingKey: key };

	$.ajax({
		type: "GET",		
		url: this.urlWithOptions(path, options),
		headers: {"X-Plex-Client-Identifier": this.X_Plex_Client_Identifier,
				"X-Plex-Product": this.X_Plex_Product,
				"X-Plex-Device": this.X_Plex_Device,
				"X-Plex-Platform": this.X_Plex_Platform,
				"X-Plex-Platform-Version": this.X_Plex_Platform_Version,
				"X-Plex-Version": this.X_Plex_Version,
				"X-Plex-Device-Name": this.X_Plex_Device_Name
			}
	});
};

PLEX.prototype.ping = function() {
  var path = "/video/:/transcode/universal/ping",
      options = { session: this.X_Plex_Client_Identifier };

	$.ajax({
		type: "GET",
		url: this.urlWithOptions(path, options),
		headers: {"X-Plex-Client-Identifier": this.X_Plex_Client_Identifier,
			"X-Plex-Product": this.X_Plex_Product,
			"X-Plex-Device": this.X_Plex_Device,
			"X-Plex-Platform": this.X_Plex_Platform,
			"X-Plex-Platform-Version": this.X_Plex_Platform_Version,
			"X-Plex-Version": this.X_Plex_Version,
			"X-Plex-Device-Name": this.X_Plex_Device_Name
		}		
	});
};

PLEX.prototype.getSessionID = function() {
	return (Math.random().toString(16)).substr(2) + (Math.random().toString(16)).substr(2);
};
// panic function to restart the parent control
PLEX.prototype.panic = function () {
    this.setShouldShowHiddenFiles("false");
    this.removeServerUrl();

//history.replaceState(null, document.title, location.pathname+"#!/stealingyourhistory");
    location.href = "index.html";
	window.close();

// history.replaceState(null, document.title, location.pathname+"#!/stealingyourhistory");
// //history.pushState(null, document.title, location.pathname);

// window.addEventListener("popstate", function() {
  // if(location.hash === "#!/stealingyourhistory") {
	// history.replaceState(null, document.title, location.pathname);
	// location.replace("index.html");
	
  // }
// }, false);
}
