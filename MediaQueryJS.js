var MediaQueryJS = {
	ids : {
		style : "mediaQuery"
	},
	mediaQueries : [],
	init : function() {

		this.getStylesheets();
		
	},
	getStylesheets : function() {
		var root = this;
		for (var i = 0; i < document.styleSheets.length; i++) {

			this.URLLoader.load(document.styleSheets[i].href, function(t, x) {
				root.onStyleLoaded(t, x);
			});
		}
	},
	onStyleLoaded : function(t, x) {
		var str = t.replace(/\s+/g, ' ');
		var arr = str.match(/\@media(.*?)\} }/g);
		for (var a = 0; a < arr.length; a++) {
			this.createQuery(arr[a]);
		}
		this.resize();
	},
	createQuery : function(str) {
		var settings = str.match(/\@media(.*?)\{/)[0];
		var style = str.replace(/\@media(.*?)\{/, "");
		style = style.replace("} }", "}");
		var query = this.getWidths(settings);
		query.text = style;
		this.mediaQueries.push(query);
	},
	getWidths : function(str) {
		var query = {
			conditions : []
		};
		//split query
		var queriesArr = str.split(",");
		for (var a = 0; a < queriesArr.length; a++) {
			//create a condition
			var obj = {
				maxWidth : null,
				minWidth : null
			}
			var arr = queriesArr[a].match(/\(([^)]+)\)/g);
			for (var b = 0; b < arr.length; b++) {
				var width = parseInt(arr[b].replace(/^\D+/g, ''));
				if (arr[b].indexOf("max-width:") >= 0) {
					obj.maxWidth = width;
				} else if (arr[b].indexOf("min-width:") >= 0) {
					obj.minWidth = width;
				}

			}
			query.conditions.push(obj);
		}
		return query;
	},
	resize : function() {

		//check media queries
		var swidth = this.stageWidth();
		var found = false;
		for (var a = 0; a < this.mediaQueries.length; a++) {
			var conditions = this.mediaQueries[a].conditions;
			//get conditions
			for (var b = 0; b < conditions.length; b++) {

				//check minwidth
				if (conditions[b].minWidth != null && conditions[b].minWidth <= swidth) {
					//check max width
					if (conditions[b].maxWidth != null && conditions[b].maxWidth >= swidth ||conditions[b].maxWidth == null) {
						this.setMediaStyle(a);
						found = true;
					}
				}else if(conditions[b].minWidth == null && conditions[b].maxWidth != null && conditions[b].maxWidth >= swidth){
					this.setMediaStyle(a);
						found = true;
				}
			}
		}
		if (!found)
			this.removeMediaStyle();
	},
	removeMediaStyle : function() {
		var style = document.getElementById(this.ids.style);
		if (!style)
			return;
		document.getElementsByTagName("HEAD")[0].removeChild(style);
		style = null;
	},
	setMediaStyle : function(index) {
		var style = document.getElementById(this.ids.style);

		if (style) {
			document.getElementsByTagName("HEAD")[0].removeChild(style);
			style = null;
		}
		style = document.createElement("STYLE");
		style.id = this.ids.style;
		style.type = "text/css";
		style.setAttribute("rel", "stylesheet");

		if (style.styleSheet) {
			style.styleSheet.cssText = this.mediaQueries[index].text;
		} else {
			style.appendChild(document.createTextNode(this.mediaQueries[index].text));
		}
		document.getElementsByTagName("HEAD")[0].appendChild(style);
	},
	stage : function() {
		return document.body;
	},
	stageWidth : function(raw) {
		if (raw)
			return (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
		return (this.stage() == window) ? (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) : (parseInt(this.stage().style.width.replace("px", "")) > 0 ? parseInt(this.stage().style.width.replace("px", "")) : this.stage().clientWidth);
	},
	URLLoader : {
		xhttp : "",
		cb : "",
		load : function(url, callback, method, params) {
			this.cb = callback;
			if (window.XMLHttpRequest) {
				this.xhttp = new XMLHttpRequest();
			} else// IE 5/6
			{
				this.xhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			if (!method)
				method = "GET";
			if (method == "GET" && params) {
				url += "?" + params;

			}
			var par = this;
			this.xhttp.onreadystatechange = function() {
				par.onStatus()
			};
			this.xhttp.open(method, url, true);
			if (method == "POST") {
				this.xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				this.xhttp.setRequestHeader("Content-length", params.length);
				this.xhttp.setRequestHeader("Connection", "close");
			}
			try {
				this.xhttp.send(params);
			} catch(e) {

			}
		},
		onStatus : function(e) {
			if (this.xhttp.readyState == 4) {
				if (this.xhttp.status == 200 || window.location.href.indexOf("http") == -1) {
					this.cb(this.xhttp.responseText, this.xhttp.responseXML);

				} else {
					//trace("error 1")
				}
			} else {
				//trace("error 2")
			}
		}
	},
	isIE : (navigator.appVersion.indexOf("MSIE") != -1),
	getInternetExplorerVersion : function() {
		var rv = -1;
		// Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent;
			var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null)
				rv = parseFloat(RegExp.$1);
		}
		return rv;
	}
};
(function(window) {

	function Main() {
		if (window.addEventListener) {
			window.addEventListener("load", onLoad);
		} else {
			window.attachEvent("onload", onLoad);
		}

	}

	function onLoad() {
		if (MediaQueryJS.isIE && MediaQueryJS.getInternetExplorerVersion() < 9) {
			MediaQueryJS.init();

			if (window.addEventListener) {
				window.addEventListener("resize", onResize);
			} else {
				window.attachEvent("onresize", onResize);
			}
		}

	}

	function onResize() {

		MediaQueryJS.resize();
	}

	Main();
}
)(window);
