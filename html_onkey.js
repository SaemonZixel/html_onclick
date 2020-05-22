/* 
 * html_onkey - JavaScript library for extend HTML and create widgets such as dropdown menu, counters, tabs, editable fields...
 * 
 * Version: 1.0
 * License: MIT
 * 
 *  Copyright (c) 2013-2020 Saemon Zixel <saemonzixel@gmail.com>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software *  and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

if("html_onkey" in window == false)
function html_onkey(event) {
	var ev = event || window.event;
	var trg1 = ev.target || ev.srcElement || document.body.parentNode;
	if (trg1.nodeType && trg1.nodeType == 9) trg1 = trg1.body.parentNode; // #document
    if (trg1.nodeType && trg1.nodeType == 3) trg1 = trg1.parentNode; // #text
	var trg1p = (trg1.parentNode && trg1.parentNode.nodeType != 9) ? trg1.parentNode : {className:'', nodeName:'', getAttribute:function(){return ''}};
	var trg1pp = (trg1p.parentNode && trg1p.parentNode.nodeType != 9) ? trg1p.parentNode : {className:'', nodeName:'', getAttribute:function(){return ''}};
	
	// для расширений
	html_onkey.ev = ev;
	html_onkey.trg1 = trg1; html_onkey.trg1p = trg1p; html_onkey.trg1pp = trg1pp;
	
	// расширения
	for (var i in html_onkey.extensions) 
	if(html_onkey.extensions[i] instanceof Function)
		html_onkey.extensions[i](ev, trg1, trg1p, trg1pp);

	// [keyup] [->], [SPACE] - next photo
	if('keyup keydown'.indexOf(ev.type) > -1 && ((ev.keyCode||0) == 39 || (ev.keyCode||0) == 32)) {
		var viewer = document.getElementById('c-image_viewer'); 
		if(viewer) {
			if(ev.type != 'keyup') { 
// 				ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false);
// 				if(ev.stopPropagation) ev.stopPropagation();
// 				else ev.cancelBubble = true;
				return false;
			}
			html_onclick({type: 'click', target: viewer.childNodes[2]});
			return false;
		}
	}
	
	// [keyup] [<-]  - previous photo
	if('keyup keydown'.indexOf(ev.type) > -1 && (ev.keyCode||0) == 37) {
		var viewer = document.getElementById('c-image_viewer'); 
		if(viewer) {
			if(ev.type != 'keyup') { 
// 				ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false);
// 				if(ev.stopPropagation) ev.stopPropagation();
// 				else ev.cancelBubble = true;
				return false;
			}
			
			html_onclick({type: 'click', target: viewer.childNodes[3]});
			ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false);
			return false;
		}
	}
	
	// [keyup] [ESC] - close 
	if('keyup keydown'.indexOf(ev.type) > -1 && (ev.keyCode||0) == 27) {
		var close_btn = (document.getElementById('c-image_viewer')||{}).lastChild;
		if(close_btn) {
			if(ev.type != 'keyup') { 
// 				ev.preventDefault ? ev.preventDefault() : (ev.returnValue = false);
// 				if(ev.stopPropagation) ev.stopPropagation();
// 				else ev.cancelBubble = true;
				return false;
			}
			
			html_onclick({type: 'click', target: close_btn});
		}
	}

	// .g-show-length-in-...
	if('keypress' == ev.type && trg1.className.indexOf('g-show-length-in-by_id') > -1 || trg1.className.indexOf('g-show-remains') > -1) {
		var length_informer = document.getElementById(trg1.className.match(/by_id-([^ ]+)/)[1]);
		if(length_informer)
			length_informer.innerHTML = 
				trg1.className.indexOf('g-show-remains') > -1 
				? parseInt(trg1.getAttribute('maxlength')||'0') - trg1.value.length
				: trg1.value.length;
	}
	
	// расширения
	for (var i in html_onkey.extensions) 
	if(html_onkey.extensions[i] instanceof Function)
		html_onkey.extensions[i](ev, trg1, trg1p, trg1pp);
	
	// для совместимости со старым кодом
	return window.html_onkey_custom ? html_onkey_custom(ev, trg1, trg1p, trg1pp) : undefined;
}

/* install html_onkey events (if first load) */
if(!html_onkey.extensions) {
	html_onkey.extensions = [];
	
	document.documentElement.addEventListener("keyup", html_onkey);
	document.documentElement.addEventListener("keypress", html_onkey);
	document.documentElement.addEventListener("keydown", html_onkey);
	document.documentElement.addEventListener("change", html_onkey);
}