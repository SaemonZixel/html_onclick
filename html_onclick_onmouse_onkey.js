/* 
 * html_onclick - JavaScript library for extend HTML and create widgets such as dropdown menu, counters, tabs, editable fields...
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

if("html_onclick" in window == false)
function html_onclick(event) {
	var ev = event || window.event;
	var trg1 = ev.target || ev.srcElement || document.body.parentNode;
	if (trg1.nodeType && trg1.nodeType == 9) trg1 = trg1.body.parentNode; // #document
	if (trg1.nodeType && trg1.nodeType == 3) trg1 = trg1.parentNode; // #text
	var trg1p = (trg1.parentNode && trg1.parentNode.nodeType != 9) ? trg1.parentNode : {className:'', nodeName:'', getAttribute:function(){return ''}};
	var trg1pp = (trg1p.parentNode && trg1p.parentNode.nodeType != 9) ? trg1p.parentNode : {className:'', nodeName:'', getAttribute:function(){return ''}};
	
	// удобная функция поиска близкого элемента по BEM
	function find_near(class_name, if_not_found_return, start_node, prefix) {
		// определим префикс блока
		if(!prefix && (prefix = class_name.indexOf('!')+1) > 0) { 
			var prefix1 = class_name.substring(0, prefix-1);
			class_name = prefix1 + class_name.substring(prefix);
		} else
			var prefix1 = prefix || class_name.replace(/^([a-z]+-[^-]+).*$/, '$1');
		var regexp = new RegExp(class_name+'( |$)','');
		
		// поищем среди соседей сначало
		for(var i = 0, root = start_node || trg1; i < root.parentNode.childNodes.length; i++)
			if((root.parentNode.childNodes[i].className||'').match(regexp))
				return root.parentNode.childNodes[i];
		
		// найдём корневой node в блоке, заодно возможно встретим искомый элемент
		for(; root.parentNode.className.indexOf(prefix1) > -1; root = root.parentNode)
			if(root.parentNode.className.indexOf(class_name) > -1 && root.parentNode.className.match(regexp))
				return root.parentNode;
		
		// перебираем всё, что ниже root
		var nodes = root.getElementsByTagName('*');
		for(var i=0; i<nodes.length; i++)
			if(nodes[i].className && nodes[i].className.indexOf(class_name) > -1 && nodes[i].className.match(regexp)) 
				return nodes[i];
			
		return if_not_found_return;
	}

	// для расширений
	html_onclick.ev = ev;
	html_onclick.ev_processed = true;
	html_onclick.trg1 = trg1; html_onclick.trg1p = trg1p; html_onclick.trg1pp = trg1pp;
	html_onclick.find_near = find_near;
	
// [outerclick] event
	if (html_onclick.outer_click_hooks.length && ev.type == 'click') {
		var save_click_hooks = [];
		for (var i = 0; i < html_onclick.outer_click_hooks.length; i++)
			if (html_onclick.outer_click_hooks[i](event, trg1))
				save_click_hooks.push(html_onclick.outer_click_hooks[i]);
		html_onclick.outer_click_hooks = save_click_hooks;
	}
	
	// g-show_hide-by_id-*
	if(trg1.className.indexOf('g-show_hide-by_id') > -1) {
		var id = trg1.className.match(/g-show_hide-by_id-([-0-9a-zA-Z_]+)/);
		var elem = document.getElementById(id[1]);
		if(elem && elem.style.display == 'none') {
			elem.style.display = 'block';
			if(elem.getAttribute('data-onshow'))
				(new Function('event', elem.getAttribute('data-onshow'))).call(elem, ev);
		} else
		if(elem && elem.style.display != 'none') {
			elem.style.display = 'none';
			if(elem.getAttribute('data-onhide'))
				(new Function('event', elem.getAttribute('data-onhide'))).call(elem, ev);
		}
	}
	
	// g-toggeble
	if(trg1.className.indexOf('g-toggeble') > -1 || trg1p.className.indexOf('g-toggeble') > -1) {
		var trg = trg1p.className.indexOf('g-toggeble') > -1 ? trg1p : trg1;
		try {
			if(trg.className.indexOf('g-toggeble-next_node') > -1)
				var toggle_node = trg.nextSibling.nodeName == '#text' ? trg.nextSibling.nextSibling : trg.nextSibling;
			else
				var toggle_node = trg.parentNode.parentNode.children[1];
		} catch(ex) {
			return;
		}
		
		var trg_style = (toggle_node.currentStyle || window.getComputedStyle(toggle_node, null));

		/*if(trg_style.display == 'none' || trg_style.height[0] == '0') {
			toggle_node.style.display = 'block';
			trg.className = trg.className.replace(/ *g-(open|close)/g, '') + ' g-open';
			if(toggle_node.className.indexOf('view_none') > -1)
				toggle_node.className = toggle_node.className.replace(/ *view_none/, '');
		} else {
			toggle_node.style.display = 'none';
			trg.className = trg.className.replace(/ *g-(open|close)/g, '') + ' g-close';
		}*/

		if(trg.className.indexOf('g-toggeble') > -1 && trg.parentNode.className.indexOf('b-catalog-filter-item') > -1) {
			if(trg.parentNode.children[1].className.indexOf('view_none') > -1) {
				trg.parentNode.children[1].className = trg.parentNode.children[1].className.replace(/ *view_none/, '');
				trg.className = trg.className.replace(/ *g-close/, ' g-open');
			} else {
				trg.parentNode.children[1].className += ' view_none';
				trg.className += ' g-close';
			}
			return;
		}
		
		if(trg.nodeName == 'A') {
			if(ev.preventDefault) ev.preventDefault();
			else ev.returnValue = false;
		}
	}
	
	// c-tabs
	if(trg1.className.indexOf('c-tabs') > -1) {
		if(trg1.className.indexOf('c-tabs-switcher') > -1) {
			
			// поищем сам переключатель если кликнули внутри
			if(trg1.className.match(/(-caption|-input_radio)/)) 
				trg1 = find_near('c-tabs-switcher');
			var active_tab = trg1.className.match(/c-tabs-switch-to-tab([^ ]+)/);			
			
			// поищем корневой контейнер для табов
			var tabs = trg1;
			while(!tabs.className.match(/c-tabs( |$)/) && tabs.parentNode)
				tabs = tabs.parentNode;
			
			var nodes = tabs.getElementsByTagName('*');
			for(var i = 0; i < nodes.length; i++)
			if(nodes[i].className && nodes[i].className.indexOf('c-tabs') > -1) {
				var node = nodes[i];
				
				// c-tabs-switcher
				if(node.className.match(/c-tabs-switcher( |$)/)) {
					node.className = node.className.replace(/( *state_active)+/, '')
						+ ((node == trg1) ? ' state_active' : '');
					find_near('c-tabs-switcher-input_radio', {}, node, 'c-tabs-switcher').checked = (node == trg1);
				}
						
				// c-tabs-tab
				if(active_tab && node.className.indexOf('c-tabs-tab') > -1) {
					node.className = node.className.replace(/ c-tabs-(hidden|visible)_tab/g, '') +
						(node.className.indexOf('c-tabs-tab'+active_tab[1]) > -1 ? ' c-tabs-visible_tab' : ' c-tabs-hidden_tab');
				}
			}
			
			// если ссылка, то отменим нажатие
			if(trg1.nodeName == 'A' || trg1p.nodeName == 'A')
				if(ev.preventDefault) ev.preventDefault();
				else ev.returnValue = false;
				
			// если это часть окна, то обновим размер
			if(tabs.className.match(/(^| )win-/) > -1) {
				html_onmouse({type: 'resize', target: tabs.lastChild});
			}
		}
	}
	
	// g-show-full-in-popup
	if(ev.type == 'click' && (trg1.className.indexOf('g-show-full-in-popup') > -1 
		|| trg1p.className.indexOf('g-show-full-in-popup') > -1)) {
		
		var trg = trg1.nodeName == 'A' ? trg1 : trg1p;
		
		// удалим текущий вьюер
		var viewer = document.getElementById('c-image_viewer'); 
		if(viewer) viewer.parentNode.removeChild(viewer);

		var trg1_offset = trg.firstElementChild.nodeName == 'IMG'
			? trg.firstElementChild.getBoundingClientRect()
			: trg.getBoundingClientRect();
		var left = Math.round(trg1_offset.left) + (window.pageXOffset||document.documentElement.scrollLeft||0);
		var top = Math.round(trg1_offset.top) + (window.pageYOffset||document.documentElement.scrollTop||0);
		var width = Math.max(trg.offsetWidth, trg.firstElementChild.offsetWidth);
		var height = Math.max(trg.offsetHeight, trg.firstElementChild.offsetHeight);

		// конструируем вьюер
		var viewer = document.createElement('DIV');
		viewer.id = 'c-image_viewer';
		viewer.className ="c-image_viewer c-image_viewer-popup c-image_viewer-loading";
		viewer.style.cssText = 'left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;';
// 		viewer.onclick = html_onclick;
		
		viewer.appendChild(document.createElement('IMG'));
		viewer.lastChild.className = "c-image_viewer-image c-image_viewer-image-loading";
		viewer.lastChild.onload = function(event){
			this.parentNode.className = this.parentNode.className.replace(/c-image_viewer-(loading|inner_loading)/, '');
			this.className = 'c-image_viewer-image c-image_viewer-image-loaded';
			this.style.width = this.style.height = 'auto';
			this.setAttribute('data-original-size', this.offsetWidth+'x'+this.offsetHeight);
			html_onclick({target: this, type: 'load'});
		};

		
		viewer.appendChild(document.createElement('DIV'));
		viewer.lastChild.className = "c-image_viewer-loading-label";
		viewer.lastChild.style.cssText = 'padding-top:'+(height/2-8)+'px';
		viewer.lastChild.appendChild(document.createElement('I'));
		viewer.lastChild.lastChild.className = 'c-image_viewer-loading-label-zooming';
		viewer.lastChild.lastChild.innerHTML = 'Увеличение...';
		viewer.lastChild.appendChild(document.createElement('I'));
		viewer.lastChild.lastChild.className = 'c-image_viewer-loading-label-downloading';
		viewer.lastChild.lastChild.innerHTML = 'Загрузка фото...';
		
		// если фотогаллерея, то добавим кнопки навигации
		if(trg1.className.indexOf('g-show-full-in-popup-with-prev-next') > -1 
		|| trg1p.className.indexOf('g-show-full-in-popup-with-prev-next') > -1 ) {
			viewer.appendChild(document.createElement('SPAN'));
			viewer.lastChild.className = "c-image_viewer-btn-next";
			viewer.lastChild.innerHTML = '&rarr;';
			viewer.appendChild(document.createElement('SPAN'));
			viewer.lastChild.className = "c-image_viewer-btn-prev";
			viewer.lastChild.innerHTML = '&larr;';
		}

		viewer.appendChild(document.createElement('SPAN'));
		viewer.lastChild.className = "c-image_viewer-btn-close";
		viewer.lastChild.innerHTML = '&times;';
		document.body.appendChild(viewer);
		
		// начнём загружать фото
		viewer.childNodes[0].src = trg.href || trg.firstElementChild.src;
		
		// [onouterclick]
		/*var html_node = document.getElementsByTagName('html')[0];
		if(html_node['addEventListener']) {
			html_node.addEventListener('click', c_image_viewer_onevent);
		} else if(html_node['attachEvent']) {
			html_node.attachEvent('onclick', c_image_viewer_onevent);
		}*/
		
		if(ev.preventDefault) ev.preventDefault();
		else ev.returnValue = false;
		
		return false;
	}

	// c-image_viewer
	if(trg1.className.indexOf('c-image_viewer') > -1) {
		var root = trg1;
		if(trg1.className.indexOf('c-image_viewer-image') > -1)
			root = trg1.parentNode;
		
		if(ev.type == 'load' && trg1.className.indexOf('c-image_viewer-image') > -1) {
			var size = trg1.getAttribute('data-original-size').match(/([0-9]+)x([0-9]+)/);
			
			// скорректируем размеры под окно броузера
			root.className = root.className+' c-image_viewer-complete';
			var root_style = root.currentStyle || window.getComputedStyle(root, null);
			var root_paddingLeftRight = parseInt(root_style.paddingLeft||'0') + parseInt(root_style.paddingRight||'0');
			var root_paddingTopBottom = parseInt(root_style.paddingTop||'0') + parseInt(root_style.paddingBottom||'0');
			var root_marginLeftRight = parseInt(root_style.marginLeft||'0') + parseInt(root_style.marginRight||'0');
			var root_marginTopBottom = parseInt(root_style.marginTop||'0') + parseInt(root_style.marginBottom||'0');
			
			var max_width = window.document.documentElement.clientWidth - root_paddingLeftRight - root_marginLeftRight;
			if(size[1] > max_width) {
				size[2] = Math.round(size[2] * (max_width / size[1]));
				size[1] = max_width;
			}

			var max_height = window.document.documentElement.clientHeight - root_paddingTopBottom - root_marginTopBottom;
			if(size[2] > max_height) {
				size[1] = Math.round(size[1] * (max_height / size[2]));
				size[2] = max_height;
			}
			
/*			var center = {
				x: parseInt(root.style.left) + parseInt(root.style.width) / 2 + parseInt(root.style.padding||'0'),
				y: parseInt(root.style.top) + parseInt(root.style.height) / 2 + parseInt(root.style.padding||'0')
			}; */
			var center = {
				x: Math.round(window.document.documentElement.clientWidth / 2),
				y: Math.round(window.document.documentElement.clientHeight / 2) + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
			};
			
			trg1.style.width = size[1]+'px'; // root.style.width;
			trg1.style.height = size[2]+'px'; // root.style.height;
			
			root.style.width = size[1]+'px';
			root.style.height = size[2]+'px';
			root.style.left = center.x - (size[1]*1) / 2 - root_marginLeftRight + 'px';
			root.style.top = center.y - (size[2]*1) / 2 - root_marginTopBottom +'px';
			
			return;
		}
		
		// CLOSE
		if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-btn-close') > -1 
			|| trg1.className == 'c-image_viewer-image') {
			if(trg1.parentNode.parentNode)
				trg1.parentNode.parentNode.removeChild(trg1.parentNode);
		}
		
		// ->
		else if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-btn-next') > -1) {
			// найдём ссылку на текущую фотку
			var img = trg1.parentNode.getElementsByTagName('IMG')[0];
			var list = document.getElementsByTagName('A');
			for(var i = 0; i < list.length; i++)
				if(list[i].href == img.src) {
					// теперь ищем следующую ссылку
					var next = list[i].parentNode.nextSibling;
					while(next && next.nodeName != 'LI') next = next.nextSibling;
					
					// нет дальше фоток, начнём сначала
					if(!next) {
						next = list[i].parentNode.parentNode.firstChild;
						while(next && next.nodeName != 'LI') next = next.nextSibling;
					}
					
					// запустим загрузку новой фотографии
					if(next && next.getElementsByTagName('A').length > 0) {
						img.parentNode.className =  img.parentNode.className.replace(/ *c-image_viewer-(complete|loading|inner_loading)/, '') + ' c-image_viewer-inner_loading';
						img.parentNode.childNodes[1].style.cssText = 'padding-top:'+(img.offsetHeight/2-8)+'px';
						img.className = "c-image_viewer-image c-image_viewer-image-loading";
						img.src = '';
						img.src = next.getElementsByTagName('A')[0].href;
						break;
					}
				}
		} 
		
		// <-
		else if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-btn-prev') > -1) {
			// найдём ссылку на текущую фотку
			var img = trg1.parentNode.getElementsByTagName('IMG')[0];
			var list = document.getElementsByTagName('A');
			for(var i = 0; i < list.length; i++)
				if(list[i].href == img.src) {
					// теперь ищем следующую ссылку
					var next = list[i].parentNode.previousSibling;
					while(next && next.nodeName != 'LI') next = next.previousSibling;
					
					// нет предыдущих фоток, начнём с конца
					if(!next) {
						next = list[i].parentNode.parentNode.lastChild;
						while(next && next.nodeName != 'LI') next = next.previousSibling;
					}
					
					if(next && next.getElementsByTagName('A').length > 0) {
						img.parentNode.className =  img.parentNode.className.replace(/ *c-image_viewer-(complete|loading|inner_loading)/, '') + ' c-image_viewer-inner_loading';
						img.parentNode.childNodes[1].style.cssText = 'padding-top:'+(img.offsetHeight/2-8)+'px';
						img.className = "c-image_viewer-image c-image_viewer-image-loading";
						img.src = '';
						img.src = next.getElementsByTagName('A')[0].href;
						break;
					}
				}
		} 
		
		// CLICK
		else if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer') > -1) {
			
			// переключим на следующую фотографию
			var btns = root.getElementsByTagName('SPAN');
			for(var i = 0; i < btns.length; i++) {
				if(btns[i].className.indexOf('c-image_viewer-btn-next') < 0) continue;
				return html_onclick({type: 'click', target: btns[i]});
			}
			
			// иначе закроем просмотр
			root.parentNode.removeChild(root);
		}
	}
	
	// [onouterclick]
	if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer') < 0) {
		var c_image_viewer = document.getElementById('c-image_viewer');
		if(c_image_viewer)
			html_onclick({type: 'click', target: c_image_viewer.lastChild});
	}
	
	// b-photo_changer
    if(trg1.className.indexOf('b-photo_changer') > -1
	  || ev.type == 'DOMContentLoaded') {

		// после зогрузки дерева, найдём список фоток и если их много покажем btn-next
		if(ev.type == 'DOMContentLoaded') {
			var all = document.getElementsByTagName('DIV');
			for(var i = 0; i < all.length; i++) 
				if(all[i].className 
				  && all[i].className.indexOf('b-photo_changer') > -1
				  && all[i].className.match(/b-photo_changer( |$)/)) {
					var list = find_near('b-photo_changer-photos', false, all[i]);
					var over_right = list ? list.children[list.children.length-1].offsetLeft + list.children[list.children.length-1].offsetWidth - list.offsetWidth + 3 : 0;
					if(over_right > 0)
						find_near('b-photo_changer-btn-next', {style:{}}, all[i]).style.display = 'block';
					else {
						find_near('b-photo_changer-btn-next', {style:{}}, all[i]).style.visibility = 'hidden';
						find_near('b-photo_changer-btn-prev', {style:{}}, all[i]).style.visibility = 'hidden';
					}
				}
		}
		
		if(trg1.className.indexOf('b-photo_changer-btn-next') > -1) {
			var list = find_near('b-photo_changer-photos');
			var over_right = list.children[list.children.length-1].offsetLeft + list.children[list.children.length-1].offsetWidth - list.offsetWidth + 3;
			if(over_right < list.offsetWidth) {
				trg1.style.display = 'none';
			} else {
				over_right = Math.round(list.offsetWidth*0.8);
			}
			find_near('b-photo_changer-btn-prev',{style:{}}).style.display = 'block';
		}
		
		if(trg1.className.indexOf('b-photo_changer-btn-prev') > -1) {
			var list = find_near('b-photo_changer-photos');
			var over_left = Math.abs(parseInt(list.children[0].style.marginLeft||'0'));
			if(over_left > list.offsetWidth) {
				over_left = Math.round(list.offsetWidth*0.8);
			} else {
				trg1.style.display = 'none';
			}
			find_near('b-photo_changer-btn-next',{style:{}}).style.display = 'block';
		}
		
		if(trg1.className.indexOf('b-photo_changer-photo') > -1) {
			// нужно ли загружать
			var trg = document.getElementById(find_near('b-photo_changer').getAttribute('data-show-into'));
			var a = trg1.nodeName == 'A' ? trg1 : trg1.parentNode;
			var a_href = a.href || a.children[0].src;
			if((trg.getAttribute('data-img-src') || '').indexOf(a_href) < 0) {
				
				// укажем статус, что загрузка пошла в облости просмотра
				trg.className = trg.className.replace(/ ?state_image_load[a-z]+/,'') + ' state_image_loading';
				trg.setAttribute('data-img-src', a_href);
				
				// загрузчик изображения
				var image_loader = document.createElement('IMG');
				document.body.appendChild(image_loader);
				image_loader.className = 'c-image_loader';
				image_loader.style.cssText = 'position:absolute;left:-999em;top:-100em;';
				image_loader.setAttribute('for', trg.id);
				image_loader.onload = function(){ html_onclick({type: 'load', target: image_loader}); };
				image_loader.src = a_href;
				
				
				// выделем активную и остальные как неактивные
				for(var i=0; i < a.parentNode.children.length; i++)
					a.parentNode.children[i].className = a.parentNode.children[i].className.replace(/ ?active/,'') + (a.parentNode.children[i] == a ? ' active' : '');
				
				// передвинем рамку, даже если её нет
				var frame = find_near('b-photo_changer-frame', {style:{}});
				frame.style.marginLeft = a.offsetLeft + 'px';

				
				/*// подкрутим активную в центр
				var margin_left = parseInt(a.parentNode.children[0].style.marginLeft||'0');
				var trg1_offset = a.offsetLeft + a.offsetWidth / 2;
				var new_margin_left = margin_left - trg1_offset + (a.parentNode.offsetWidth-3) / 2;
				if(new_margin_left > 0) { 
					new_margin_left = 0;
					find_near('b-photo_changer-btn-prev',{style:{}}).style.display = 'none';
				} else {
					find_near('b-photo_changer-btn-prev',{style:{}}).style.display = 'block';
				}
				
				var margin_left_limit = margin_left - a.parentNode.children[a.parentNode.children.length-1].offsetLeft - a.parentNode.children[a.parentNode.children.length-1].offsetWidth + a.parentNode.offsetWidth-3;
				if(new_margin_left < margin_left_limit) {
					new_margin_left = margin_left_limit;
					find_near('b-photo_changer-btn-next',{style:{}}).style.display = 'none';
				} else {
					find_near('b-photo_changer-btn-next',{style:{}}).style.display = 'block';
				} */
				
				if(ev.preventDefault) ev.preventDefault();
				else ev.returnValue = false;
			}
		}
	}
    
	// -------- g-editable-* -------------
			
	// .g-editable-by-menu
	if(ev.type == 'click' && (trg1.className.indexOf('g-editable-by-menu') > -1
		|| (trg1p.className.indexOf('g-editable-by-menu') > -1)
		|| (trg1pp.className.indexOf('g-editable-by-menu') > -1))) {
		var trg = trg1.className.indexOf('g-editable-by-menu') > -1 ? trg1 : 
			(trg1p.className.indexOf('g-editable-by-menu') > -1 ? trg1p : trg1pp);
		
		if(trg.getAttribute('data-editable-menu_parent_id')) {
			var menu_parent = document.getElementById(trg.getAttribute('data-editable-menu_parent_id'));
			// если родительский элемент меньше, то используем его для покрывающей области
			if(menu_parent.offsetHeight > menu_parent.parentNode.offsetHeight) {
				var menu_parent_bbox = menu_parent.parentNode.getBoundingClientRect();
				menu_parent_bbox = {left: menu_parent_bbox.left, top: menu_parent_bbox.top, width: menu_parent.parentNode.clientWidth, height: menu_parent.parentNode.clientHeight};
			} else {
				var menu_parent_bbox = menu_parent.getBoundingClientRect();
				menu_parent_bbox = {left: menu_parent_bbox.left, top: menu_parent_bbox.top, width: menu_parent.clientWidth, height: menu_parent.clientHeight};
			}
		} else {
			var menu_parent = document.body;
			var menu_parent_bbox = {left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
		}
		
		var menu;
		if(trg.getAttribute('data-editable-menu_id'))
			menu = document.getElementById(trg.getAttribute('data-editable-menu_id'));
		
		if(!menu && trg.getAttribute('data-editable-menu_items')) {
			menu = document.createElement('DIV');
			menu.id = 'menu'+(new Date())*1;
			menu.className = 'c-dropdown-menu remove_on_hide';
			
			var list = trg.getAttribute('data-editable-menu_items').split(';');
			for(var i=0; i < list.length; i++) if(list[i] != '') {
				var menu_item = document.createElement('DIV');
				menu_item.className = "c-dropdown-menu-item";
				menu.appendChild(menu_item);
				
				var sep = list[i].indexOf('=');
				if(sep > -1) {
					menu_item.innerHTML = list[i].substring(sep+1);
					menu_item.setAttribute('data-value', list[i].substring(0, sep));
				} else
					menu_item.innerHTML = list[i];
			}
			
			menu_parent.appendChild(menu);
		}
		
		trg.id = trg.id || 'target'+(new Date())*1;
		//trg.className = trg.className.replace(/ ?g-editable-by-menu-active/, '')+' g-editable-by-menu-active';

		menu.setAttribute('for', trg.id);
		menu.style.cssText = 'position:absolute;top:-1000px;left:-2000px;display:block;z-index:1000;'+(trg.getAttribute('data-editable-menu_style')||'');
		var menu_offset = menu.getBoundingClientRect(); // реальное положение
			
		
		if(trg.getAttribute('data-editable-menu_origin') == 'event_clientXY') {
			var trg_offset = {left: ev.clientX, top: ev.clientY};
			menu.style.left = ev.clientX + 'px';
			menu.style.top = ev.clientY + 'px';
			//menu.style.maxHeight = Math.round((menu_parent.nodeName == 'BODY' ? window.innerHeight : menu_parent.offsetHeight) - trg_offset.top - 5) + 'px';
		} else {
			var trg_offset = trg.getBoundingClientRect();
			menu.style.left = trg_offset.left - (menu_offset.left + 2000) + 'px';
			menu.style.top = trg_offset.top - (menu_offset.top + 1000) + trg.offsetHeight + 'px';
			
			/* Math.round((menu_parent.nodeName == 'BODY' ? window.innerHeight : menu_parent.offsetHeight) - trg_offset.top - trg.offsetHeight - 5) + 'px';*/
		}
		menu.style.overflowY = 'auto';
		menu.style.overflowX = 'hidden';
		menu.style.maxWidth = menu_parent_bbox.width + menu_parent_bbox.left - trg_offset.left + 'px';
		menu.style.minWidth = Math.min(trg1.offsetWidth, parseFloat(menu.style.maxWidth)) + 'px';
		if(navigator.userAgent.match(/Firefox\/(1[0-6]|[1-9])./)) // у меня старый FF :)
			menu.style.height = Math.min(menu_offset.height, menu_parent_bbox.height + menu_parent_bbox.top - trg_offset.top - trg_offset.height) + 'px';
		else
			menu.style.maxHeight = menu_parent_bbox.height + menu_parent_bbox.top - menu_parent_bbox.top - trg_offset.height + 'px';
				
		// скрытие меню
		html_onclick.outer_click_hooks.push(function(event){ 
		
			// удалим либо скроем
			if(menu.className.indexOf('remove_on_hide') > -1)
				menu.parentNode.removeChild(menu);
			else
				menu.style.display = 'none'; 
			
			// если есть обработчик на изменения, то вызовим
// 					if(trg1.getAttribute('onchange'))
// 						setTimeout(function() {
// 						(new Function('event', trg1.getAttribute('onchange'))).call(trg1, {type: 'change', target: trg1});
// 						}, 0);
		});

	}
	
	// g-editable-by-input
	if(ev.type == 'click' && (trg1.className.indexOf('g-editable-by-input') > -1 
		&& trg1.className.indexOf('g-editable-by-input-input') < 0)) {
		
		trg1.id = trg1.id || 'id'+(new Date())*1;
		
		var inp = document.createElement('INPUT');
		inp.className = 'g-editable-by-input-input';
		inp.setAttribute('for', trg1.id);
		
		if(trg1.getAttribute('data-value-if-empty') && trg1.getAttribute('data-value-if-empty') != trg1.innerHTML) inp.value =  trg1.innerHTML;
		else inp.value = trg1.innerHTML;
		
		if(trg1.className.indexOf('type_float') > -1)
			inp.value = inp.value.replace(/ +/g, '');
		
		// добавим перехват клавиши ENTER
		inp.onkeyup = function(event){
			var ev = event || window.event;
			if(ev.keyCode == 13) return html_onevent({target: document.body, type: 'click'});
		};
		
		var offset = trg1.getBoundingClientRect();
		var scroll_top = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
		inp.style.cssText = 'width:'+(trg1p.offsetWidth > trg1.offsetWidth ? trg1p.offsetWidth-trg1.offsetLeft-2 : trg1.offsetWidth) + 'px;height:' + trg1.offsetHeight + 'px;position:absolute;left:' + (offset.left) + 'px;top:' + (scroll_top+offset.top) + 'px;'+(trg1.getAttribute('data-editable-input-style')||'');
		
		document.body.appendChild(inp);
		inp.focus();
		
		var now = (new Date())*1 + 40;
		html_onclick.outer_click_hooks.push(function(event){ 
			if(trg == inp || now > (new Date())*1) return true;
			if(inp.value == '' && trg1.getAttribute('data-value-if-empty'))
				trg1.innerHTML = trg1.getAttribute('data-value-if-empty');
			else if(trg1.className.indexOf('type_float') > -1) {
				
				// функция оформления цены
				function stringToMoney(string) {
					var price = (string+'').match(/([0-9]+)(\.([0-9]+))?/);
					if(999 < price[1])
						price[1] = price[1].toString().split('').reverse().join('').replace(/^(.)(.)(.)(.)(.)?(.)?(.)?(.)?(.)?$/, '$9$8$7&nbsp;$6$5$4&nbsp;$3$2$1&nbsp;').replace(/&nbsp;$/, '').replace(/^(&nbsp;)+/, '');
					return price[1];
				}
				
				trg1.innerHTML = stringToMoney(inp.value);
			}
			else
				trg1.innerHTML = inp.value;
			
			inp.parentNode.removeChild(inp);
			
			if(trg1.getAttribute('onchange'))
				(new Function('event', trg1.getAttribute('onchange'))).call(trg1, {type: 'change', target: trg1});
		})
	}
	
	// .g-editable-by-textarea
	if(ev.type == 'click' && (trg1.className.indexOf('g-editable-by-textarea') > -1 
		&& trg1.className.indexOf('g-editable-by-textare-textarea') < 0)) {
		trg1.id = trg1.id || 'id'+(new Date())*1;

		// создадим область редактирования
		var inp = document.createElement('TEXTAREA');
		inp.className = 'g-editable-by-input-input';
		inp.setAttribute('for', trg1.id);
		inp.value = trg1.innerHTML;

		//  стандартные стили для области редактирования
		var trg1_style = (trg1.currentStyle || window.getComputedStyle(trg1, null));
		inp.style.cssText = 'width:' + trg1.offsetWidth + 'px;height:' + trg1.offsetHeight + 'px;position:absolute;overflow:hidden;margin:0;font:'+trg1_style.fontWeight+' '+trg1_style.fontSize+' '+trg1_style.fontFamily+'; '+(trg1.getAttribute('data-editable-textarea-style')||'');
		
		// вычеслим местоположение
		var offset = trg1.getBoundingClientRect();
		if(trg1.getAttribute('data-editable-parent_id')) {
			var inp_parent = document.getElementById(trg1.getAttribute('data-editable-parent_id'));
			var inp_parent_offset = inp_parent.getBoundingClientRect();
			inp.style.top = offset.top-1 - inp_parent_offset.top + 'px';
			inp.style.left = offset.left-1 - inp_parent_offset.left + 'px';
		} else {
			var inp_parent = document.body;
			var scroll_top = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
			inp.style.top = scroll_top + offset.top-1 + 'px';
			inp.style.left = offset.left-1 + 'px';
		}
		
		// создадим специальный DIV для вычесления размера
		var analyze_div = document.createElement('DIV');
		analyze_div.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;width:' + trg1.offsetWidth + 'px;left:-9999em;top:-9999em;font:'+trg1_style.fontWeight+' '+trg1_style.fontSize+' '+trg1_style.fontFamily+';';
		analyze_div.innerHTML = trg1.innerHTML;
		document.body.appendChild(analyze_div);
		
		// при каждом нажатии корректируем высоту TEXTAREA
		inp.onkeyup = function(event){
			var ev1 = event || window.event || {};
			analyze_div.innerHTML = inp.value+' ';
			
			// подкорректируем высоту если изменилась
			if(parseInt(inp.style.height) != analyze_div.offsetHeight) {
				inp.style.height = analyze_div.offsetHeight + 'px';
				trg1.innerHTML = inp.value;
			}
			
// console.log(analyze_div.offsetHeight);
		};
		
		inp_parent.appendChild(inp);
		inp.focus();
		
		var now = (new Date())*1 + 40;
		html_onclick.outer_click_hooks.push(function(event, trg){ 
			if(trg == inp || now > (new Date())*1) return true;
			if(inp.value == '' && trg1.getAttribute('data-value-if-empty'))
				trg1.innerHTML = trg1.getAttribute('data-value-if-empty');
			else
				trg1.innerHTML = inp.value;
				
			inp.parentNode.removeChild(inp);
				
			if(trg1.getAttribute('onchange'))
				(new Function('event', trg1.getAttribute('onchange'))).call(trg1, {type: 'change', target: trg1});
		});
	}
	
	// .g-editable-by-checklist_menu
	if(ev.type == 'click' && (trg1.className.indexOf('g-editable-by-checklist_menu') > -1
		|| (trg1p.className.indexOf('g-editable-by-checklist_menu') > -1)
		|| (trg1pp.className.indexOf('g-editable-by-checklist_menu') > -1))) {
		var trg = trg1.className.indexOf('g-editable-by-checklist_menu') > -1 ? trg1 : 
			(trg1p.className.indexOf('g-editable-by-checklist_menu') > -1 ? trg1p : trg1pp);
		
		if(trg.getAttribute('data-editable-menu_parent_id'))
			var menu_parent = document.getElementById(trg.getAttribute('data-editable-menu_parent_id'));
		else
			var menu_parent = document.body;
		
		var menu;
		if(trg.getAttribute('data-editable-menu_id'))
			menu = document.getElementById(trg.getAttribute('data-editable-menu_id'));
			
		if(!menu && trg.getAttribute('data-editable-menu_items')) {
			menu = document.createElement('DIV');
			menu.id = 'menu'+(new Date())*1;
			menu.className = 'c-dropdown-checklist_menu remove_on_hide';
			
			var list = trg.getAttribute('data-editable-menu_items').split(';');
			for(var i=0; i < list.length; i++) {
				var menu_item_chkbox = document.createElement('INPUT');
				menu_item_chkbox.className = 'c-dropdown-checklist_menu-checkbox';
				menu_item_chkbox.type = 'checkbox';
				menu_item_chkbox.value = list[i];
				menu_item_chkbox.checked = !!trg.innerHTML.match(new RegExp(list[i]+' *(;?|$)'));
				
				var menu_item = document.createElement('DIV');
				menu_item.className = "c-dropdown-checklist_menu-item";
				menu_item.appendChild(menu_item_chkbox);
				menu_item.appendChild(document.createTextNode(list[i]));
				
				menu.appendChild(menu_item);
			}
			
			var menu_item = document.createElement('DIV');
			menu_item.className = 'c-dropdown-checklist_menu-closer';
			menu_item.innerHTML = 'закрыть';
			menu.appendChild(menu_item);
			
			menu_parent.appendChild(menu);
		}
		
		trg.id = 'target'+(new Date())*1;
		//trg.className = trg.className.replace(/ ?g-editable-by-menu-active/, '')+' g-editable-by-menu-active';

		menu.setAttribute('for', trg.id);
		menu.style.cssText = 'position:absolute;top:-1000px;left:-2000px;display:block;z-index:1000;'+(trg.getAttribute('data-editable-menu_style')||'');
		var menu_offset = menu.getBoundingClientRect(); // реальное положение
			
		/*var scroll_top = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;*/
		if(trg.getAttribute('data-editable-menu_origin') == 'event_clientXY')
			var trg_offset = {left: ev.clientX, top: ev.clientY};
		else 
			var trg_offset = trg.getBoundingClientRect();
		menu.style.left = trg_offset.left - (menu_offset.left + 2000) + 'px';
		menu.style.top = trg_offset.top - (menu_offset.top + 1000) + trg.offsetHeight + 'px';
		menu.style.overflowY = 'auto';
		menu.style.overflowX = 'hidden';
		menu.style.maxHeight = Math.max(60,  Math.round(window.innerHeight - trg_offset.top - trg.offsetHeight - 5)) + 'px';
		//menu.style.maxHeight = Math.max(60, Math.round((menu_parent.nodeName == 'BODY' ? window.innerHeight : (menu_parent.offsetHeight > menu_parent.parentNode.offsetHeight ? menu_parent.parentNode.offsetHeight : menu_parent.offsetHeight)) - trg_offset.top - trg.offsetHeight - 5)) + 'px';
		menu.style.minWidth = trg1.offsetWidth + 'px';

		html_onclick.outer_click_hooks.push(function(event, trg){ 
			if(target.className.indexOf('c-dropdown-checklist_menu') > -1
				&& target.className.indexOf('c-dropdown-checklist_menu-closer') < 0) 
				return true; // пропустим клик
				
			if(menu.className.indexOf('remove_on_hide') > -1)
				menu.parentNode.removeChild(menu);
			else
				menu.style.display = 'none'; 
			
			if(trg1.getAttribute('onchange'))
				(new Function('event', trg1.getAttribute('onchange'))).call(trg1, {type: 'change', target: trg1});
		});
	}
	
	// .c-dropdown-checklist_menu
	if(ev.type == 'click' && trg1.className.indexOf('c-dropdown-checklist_menu') > -1) {
		if(trg1.className.indexOf('c-dropdown-checklist_menu-checkbox') > -1) {
			//trg1.checked = !trg1.checked;
			
			// отменим переключение
			/*if(ev.preventDefault) ev.preventDefault();
			else ev.returnValue = false;
			return false;*/
		} else if(trg1.firstElementChild) {
			trg1.firstElementChild.checked = !trg1.firstElementChild.checked;
		}
		
		// пройдёмся по чекбоксам и составим новый список
		var menu = trg1['value'] ? trg1.parentNode.parentNode : trg1.parentNode;
		var list = menu.getElementsByTagName('INPUT');
		var new_value = [];
		for(var i=0; i < list.length; i++) {
			if(list[i].checked) new_value.push(list[i].innerHTML);
		}
		
		var control = document.getElementById(menu.getAttribute('for'));
		control.innerHTML = new_value.join(';');
	}
	
	// .c-dropdown-menu
	if(ev.type == 'click' && trg1.className.indexOf('c-dropdown-menu-item') > -1) {
		var menu = trg1.parentNode;
		menu.style.display = 'none';
	
		// выбранный manu-item
		/* if(trg1.parentNode.className.indexOf('c-dropdown-menu-item') > -1)
			trg1 = trg1.parentNode; */

		// к кому привязано меню?
		var target_id = menu.getAttribute('for');
		if(!target_id) return;
		
		// найден ли элемент приёмник
		var control = document.getElementById(target_id); // g-change-via-dropdown...
		if(!control) return;
		menu.removeAttribute('for');

		// c-dropdown-menu-set_value_here есть?
		var set_value_here = find_near('c-dropdown-menu-set_value_here', control, control)
		
		set_value_here.innerHTML = trg1.innerHTML;
		if(!!trg1.getAttributeNode('data-value')) 
			set_value_here.setAttribute('data-value', trg1.getAttribute('data-value'));
		else
			set_value_here.removeAttribute('data-value');
			
		if(control.getAttribute('onchange')) 
			(new Function('event', control.getAttribute('onchange'))).call(control, {type:'change',target:control});
		
		if(menu.className.indexOf('remove_on_hide') > -1 && menu.parentNode)
			menu.parentNode.removeChild(menu);
		else
			menu.style.display = 'none'; 
		//trg1.className = trg1.className.replace(/ ?g-change-via-dropdown-active/, '');
		
		return;
	} 

    // g-editable-by-counter
	if(trg1.className.indexOf('g-editable-by-counter') > -1 
		&& trg1.className.indexOf('g-editable-by-counter-counter') < 0) {
		trg1.id = trg1.id || 'id'+(new Date())*1;
		
		var div = document.createElement('div');
		div.className = 'c-counter mod_fly';
		div.innerHTML = '<div class="c-counter-h"><div class="c-counter-dec">-</div><input class="c-counter-input" type="text" value="'+parseInt(trg1.innerHTML.replace(/<[^>]+>/g,'').replace(/\s+/,''))+'"><div class="c-counter-inc">+</div></div>';

		// текстовый node
		var textnode_id = trg1.className.match(/textnode_id-([^ ]+)/) || ['', trg1.id];
		div.setAttribute('data-textnode_id', textnode_id[1]);
	
		// настоящий input
		var input_id = trg1.className.match(/input_id-([^ ]+)/);
		if(input_id)
			div.setAttribute('data-input_id', input_id[1]);

		var trg1_offset = trg1.getBoundingClientRect();
		var left = Math.round(trg1_offset.left) + (window.pageXOffset||document.documentElement.scrollLeft||0);
		var top = Math.round(trg1_offset.top) + (window.pageYOffset||document.documentElement.scrollTop||0);
		div.style.cssText = 'left:'+left+'px;top:'+top+'px;';
		document.body.appendChild(div);
			
		html_onclick.outer_click_hooks.push(function(event, trg){ 
			if(trg.className.indexOf('c-counter') > -1) return true;
			div.parentNode.removeChild(div);
		});
	}
    
    // c-counter
	if(trg1.className.indexOf('c-counter') > -1) {
		var counter = find_near('c-counter');
		
		// нормализуем значение
		var inp = find_near('c-counter-input');
		var min_value = inp.getAttribute('data-min_value') || 0;
		inp.value = isNaN(parseInt(inp.value)) ? min_value : parseInt(inp.value);
		
		// -
		if(trg1.className.indexOf('c-counter-dec') > -1) {
			inp.value = inp.value*1-1 < min_value ? min_value : inp.value*1 - 1;
			html_onclick({type:'change', target: counter});
		}
		
		// +
		if(trg1.className.indexOf('c-counter-inc') > -1) {
			inp.value = inp.value*1 + 1;
			html_onclick({type:'change', target: counter});
		}
		
		// change or input
		if(ev.type == 'change' || ev.type == 'input') {
			var node = document.getElementById(counter.getAttribute('data-textnode_id'));
			node.innerHTML = inp.value;
			
			var input = document.getElementById(counter.getAttribute('data-input_id')||'') || {};
			input.value = inp.value;
			
			// кинем Event(oninput)
			if(document.createEvent) {
				var event_oninput = document.createEvent('HTMLEvents');
				event_oninput.initEvent('input', true, true);
				input.dispatchEvent(event_oninput);
			} else if(document.createEventObject) { // IE<9
				html_onclick({type:'input', target:input });
			}
		}
	}
	
	// расширения
	for (var i in html_onclick.extensions)
	if(html_onclick.extensions[i] instanceof Function)
		html_onclick.extensions[i](ev, trg1, trg1p, trg1pp, find_near);
	
	// совместимость со старыми версиями
	return window.html_onclick_custom ? html_onclick_custom(ev, trg1, trg1p, trg1pp, find_near) : undefined;
}

/* install html_onclick events (if first load) */
if(!html_onclick.extensions) {
	html_onclick.extensions = [];
	html_onclick.outer_click_hooks = [];
	
	document.documentElement.addEventListener("click", html_onclick);
	document.documentElement.addEventListener("input", html_onclick);

	document.addEventListener("DOMContentLoaded", function(event) {
		if(document.readyState != 'complete') return;
		html_onclick({type: 'DOMContentLoaded', target: document});
	});
}

/* 
 * html_onmouse - JavaScript library for extend HTML and create widgets such as trackbars, windows, draggable elements...
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

if("html_onmouse" in window == false)
function html_onmouse(event) {
	var ev = event || window.event || { type:'', target: document.body.parentNode };
    var trg1 = ev.target || ev.srcElement || document.body.parentNode;
	if (trg1.nodeType && trg1.nodeType == 9) trg1 = trg1.body.parentNode; // #DOCUMENT
    if (trg1.nodeType && trg1.nodeType == 3) trg1 = trg1.parentNode; // #TEXT
	var trg1p = (trg1.parentNode && trg1.parentNode.nodeType != 9) ? trg1.parentNode : {className:'', nodeName:'', getAttribute:function(){return ''}};

	// mouseout-window
	if( ev.type == "mouseout" && ev instanceof Event) {
		e = ev.originalEvent || ev; // if jQuery.Event
		active_node = (e.relatedTarget) ? e.relatedTarget : e.toElement;
		if(!active_node) {
// 				html_onmouse({type:'mouseout-window',target:(document.body||{}).parentNode||window});
			html_onmouse({type:"mouseout-window", target: trg1});
			return;
		}
	}
	
	function find_near(class_name, if_not_found_return, start_node, prefix) {
		// определим префикс блока
		if(!prefix && (prefix = class_name.indexOf('!')+1) > 0) { 
			var prefix1 = class_name.substring(0, prefix-1);
			class_name = prefix1 + class_name.substring(prefix);
		} else
			var prefix1 = prefix || class_name.replace(/^([a-z]+-[^-]+).*$/, '$1');
			
		// найдём корневой node в блоке
		for(var root = start_node || trg1; root.nodeName != 'HTML' && root.parentNode.className.indexOf(prefix1) > -1; root = root.parentNode);
		
		if(root.className.indexOf(class_name) > -1) return root;
		
		var nodes = root.getElementsByTagName('*');
		for(var i=0; i<nodes.length; i++)
			if(nodes[i].className && nodes[i].className.indexOf(class_name) > -1) 
				return nodes[i];
			
		return if_not_found_return;
	}
	
	// для расширений
	html_onmouse.ev = ev;
	html_onmouse.trg1 = trg1; html_onmouse.trg1p = trg1p;
	html_onmouse.find_near = find_near;
	
	// .g-draggable [START...]
	if(ev.type == 'mousedown' && trg1.className.indexOf('g-draggable') > -1) {
		var ev_pageX = ev.pageX || (ev.clientX+document.documentElement.scrollLeft);
		var ev_pageY = ev.pageY || (ev.clientY+document.documentElement.scrollTop);

		// возмём целевой для перетаскивания
		var trg = trg1;
		if(trg.className.indexOf('g-draggable-parent4') >= 0) trg = trg.parentNode.parentNode.parentNode.parentNode;
		else if(trg.className.indexOf('g-draggable-parent3') >= 0) trg = trg.parentNode.parentNode.parentNode;
		else if(trg.className.indexOf('g-draggable-parent2') >= 0) trg = trg.parentNode.parentNode; 
		else if(trg.className.indexOf('g-draggable-parent') >= 0) trg = trg.parentNode;
	
		// отменим всплытие, и запретим выделение
		if(ev.stopPropagation) ev.stopPropagation();
		else ev.cancelBubble = true;
		document.ondragstart = function(){ return false; }
		document.body.onselectstart = function() { return false } // IE8
		
		// стартовые кординаты мыши
		trg.setAttribute('data-mousedown_point', ev_pageX+' '+ev_pageY+' '+ev.clientX+' '+ev.clientY);
		
		var trg_offset = trg.getBoundingClientRect();
		var trg_style = trg.currentStyle || window.getComputedStyle(trg, null);
		var start_params = [
			trg.offsetHeight, trg.offsetWidth,
			parseInt(trg_style.left == 'auto' ? '0' : trg_style.left),
			parseInt(trg_style.top == 'auto' ? '0' : trg_style.top),
			trg_offset.left, trg_offset.top,
			Math.round(trg_offset.left) + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
			Math.round(trg_offset.top) + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
		];
		trg.setAttribute('data-start_params', start_params.join(' '));
		trg.style.position = trg_style.position;
		
		html_onmouse.cursor.dragging_element = trg;
		ev.preventDefault();
		return false; // подавим активацию выделения
	}
	
	// .g-draggable [...MOVE...]
	if(ev.type == 'mousemove' && html_onmouse.cursor['dragging_element']) {
		var trg = html_onmouse.cursor.dragging_element;
		var base_point = trg.getAttribute('data-mousedown_point').split(' ');
		var start_params = trg.getAttribute('data-start_params').split(' ');
		switch(trg.style.position) {
			case 'fixed':
				trg.style.left = parseInt(start_params[4])+ev.clientX-parseInt(base_point[2])+'px';
				trg.style.top = parseInt(start_params[5])+ev.clientY-parseInt(base_point[3])+'px';
				break;
			default:
			case 'static':
				trg.style.position = 'relative';
			case 'relative':
			case 'absolute':
				var ev_pageX = ev.pageX || (ev.clientX+document.documentElement.scrollLeft);
				var ev_pageY = ev.pageY || (ev.clientY+document.documentElement.scrollTop);
				trg.style.left = parseInt(start_params[2])+ev_pageX-parseInt(base_point[0])+'px';
				trg.style.top = parseInt(start_params[3])+ev_pageY-parseInt(base_point[1])+'px';
				break;
		}
		
		if(ev.stopPropagation) ev.stopPropagation();
		else ev.cancelBubble = true;
	}

	// .g-draggable [...END]
	if(ev.type == 'mouseup') {
		for(var f in html_onmouse.cursor)
			if(f.indexOf('dragging_') === 0)
				delete html_onmouse.cursor[f];
			
		document.ondragstart = null;
		document.body.onselectstart = null; // IE8
	}
	
	// .b-trackbar [START...]
	if(ev.type == 'mousedown' && trg1.className.indexOf('b-trackbar-handle') > -1) {
		html_onmouse.cursor.dragging_trackbar_handle = trg1;
		
		// отменим всплытие, и запретим выделение
/*		if(ev.stopPropagation) ev.stopPropagation();
		else ev.cancelBubble = true;  */
//		document.ondragstart = function(){ return false; }
		document.body.onselectstart = function() { return false } // IE8
		return false;
	}
	
	// .b-trackbar [...MOVE...]
	if(html_onmouse.cursor.dragging_trackbar_handle && ev.type == 'mousemove'
		|| (ev.type == 'valuechanged' && !html_onmouse.cursor.dragging_trackbar_handle)) {
		var trg = html_onmouse.cursor.dragging_trackbar_handle || trg1;
//if(ev.type == 'valuechanged') console.log(ev);
		// либо передвинули указатель, либо сменили занчение
		if(ev.type == 'valuechanged') {
			var step = parseInt(trg.getAttribute('data-step') || '1');
			var new_left = (ev.value||'').replace(/ +/g, '') / step;
		} else {
			var rect = trg.parentNode.getBoundingClientRect();
			var left = Math.round(rect.left) + (window.pageXOffset||document.documentElement.scrollLeft||0) - 3;
			var new_left = ((ev.pageX || ev.clientX) - left) / (trg.parentNode.offsetWidth/100);
		}
		
		// границы
		if(trg.className.indexOf('handle-left') > -1) {
			if(new_left < 0) new_left = 0;
			if(new_left > parseInt(trg.parentNode.children[2].style.left)) 
				new_left = parseInt(trg.parentNode.children[2].style.left);
		} else {
			if(new_left > 100) new_left = 100;
			if(new_left < parseInt(trg.parentNode.children[1].style.left)) 
				new_left = parseInt(trg.parentNode.children[1].style.left);
		}
		
		// передвинем
		trg.style.left = Math.round(new_left) + '%';
		
		// засветления
		if(trg.className.indexOf('handle-left') > -1)
			trg.parentNode.children[0].children[1].style.width = new_left + '%';
		else
			trg.parentNode.children[0].children[2].style.width = 100 - new_left + '%';
		
		// обновим занчение в поле
		if(trg.getAttribute('data-input_id') && ev.type != 'valuechanged') {
			var input = document.getElementById(trg.getAttribute('data-input_id'));
			var step = parseInt(trg.getAttribute('data-step') || '10');
			if(step < 100)
				input.value = stringToMoney(Math.round(Math.round(new_left * step)/10)*10).replace(/&nbsp;/g,' ');
			else if(step < 1000)
				input.value = stringToMoney(Math.round(Math.round(new_left * step)/100)*100).replace(/&nbsp;/g,' ');
			else 
				input.value = stringToMoney(Math.round(Math.round(new_left * step)/1000)*1000).replace(/&nbsp;/g,' ');
			
			// кинем Event(oninput)
			if(document.createEvent) {
				var event_oninput = document.createEvent('HTMLEvents');
				event_oninput.initEvent('input', true, true);
				input.dispatchEvent(event_oninput);
			} else if(document.createEventObject) { // IE<9
				html_onclick({type:'input', target:input });
			}
			
		}

	}
	
	// .win-splitter [START...]
	if(ev.type == 'mousedown' && trg1.className.indexOf('win-splitter') > -1) {
		// стартовые кординаты мыши
		trg1.setAttribute('data-mousedown-point', (ev.pageX || (ev.clientX+document.documentElement.scrollLeft))+' '+(ev.pageY || (ev.clientY+document.documentElement.scrollTop)));
		
		// стартовое положение
		trg1.setAttribute('data-start-left-top', parseInt(trg1.style.left) + ' ' + parseInt(trg1.style.top));
		
		// найдём родительское окно
		for(trg1.win = trg1.parentNode; 
			!trg1.win.className.match(/win( |$)/); 
			trg1.win = trg1.win.parentNode)
			if(trg1.win.parentNode.nodeType != 1) break;

		// сгенерируем уникальный id если нет
		trg1.id = trg1.id || trg1.win.id+'_splitter'+(new Date())*1;
			
		// запомним, кого мы перетаскиваем
		html_onmouse.cursor.dragging_splitter = trg1;
			
		// запретим выделение
		document.body.onselectstart = function() { return false }
		document.ondragstart = function(){ return false; }
		
		// подавляем начало выделения мышью
		if(ev.preventDefault) ev.preventDefault();
		else ev.returnValue = false;
	}

	// .win-splitter [...DRAG]
	if(ev.type == 'mousemove' && html_onmouse.cursor['dragging_splitter']) {
		var trg = html_onmouse.cursor['dragging_splitter'];
		var ev_pageX = ev.pageX || (ev.clientX+document.documentElement.scrollLeft);
		var ev_pageY = ev.pageY || (ev.clientY+document.documentElement.scrollTop);

		var mousedown_point = trg.getAttribute('data-mousedown-point');
		mousedown_point = mousedown_point ? mousedown_point.split(' ') : [ev_pageX||0, ev_pageY||0];

		var start_left_top = trg.getAttribute('data-start-left-top');
		start_left_top = start_left_top ? start_left_top.split(' ') : [trg.style.left||'0', trg.style.top||'0'];
		
		// вычесляем отклонение
		var delta_x = ev_pageX - mousedown_point[0];
		var delta_y = ev_pageY - mousedown_point[1];
		
		if(trg.className.indexOf('type_vertical') > -1) {
			trg.force_delta_right = trg.force_delta_left = parseInt(start_left_top[0]) + delta_x - parseInt(trg.style.left||'0');
// 			trg.style.left = parseInt(start_left_top[0]) + delta_x + 'px';
		} else {
			trg.force_delta_top = trg.force_delta_bottom = parseInt(start_left_top[1]) + delta_y - parseInt(trg.style.top||'0');
// 			trg.style.top = parseInt(start_left_top[1]) + delta_y + 'px';
		}
		
		// запустим resize окна, чтоб зависимые элементы изменили свой размер и положение
		html_onmouse({type: 'winresize', target: trg.win});
		
		delete trg.force_delta_left; delete trg.force_delta_right;
		delete trg.force_delta_top; delete trg.force_delta_bottom;
	}
	
	// .win-resizer [mousedown]
	if(ev.type == 'mousedown' && trg1.className.indexOf('win-resizer') > -1) {
		
		// стартовые кординаты мыши
		trg1.setAttribute('data-mousedown_point', (ev.pageX || (ev.clientX+document.documentElement.scrollLeft))+' '+(ev.pageY || (ev.clientY+document.documentElement.scrollTop)));
		trg1.removeAttribute('data-start_size');
		
		html_onmouse.cursor.dragging_window_resizer = trg1;
		
		// запретим выделение
		document.body.onselectstart = function() { return false } // old IE
		document.ondragstart = function(){ return false; } // old browsers
		ev.preventDefault();
	}

	// .win-resizer [mousemove]
	if(ev.type == 'mousemove' && html_onmouse.cursor['dragging_window_resizer']) {
		var trg = html_onmouse.cursor.dragging_window_resizer || trg1;
		var parent_div = trg.parentNode;
		var ev_pageX = ev.pageX || (ev.clientX+document.documentElement.scrollLeft);
		var ev_pageY = ev.pageY || (ev.clientY+document.documentElement.scrollTop);
		
		var start_point = trg.getAttribute('data-mousedown_point');
		if(!start_point) trg.setAttribute('data-mousedown_point', (start_point = (ev_pageX||0)+' '+(ev_pageY||0)));
		start_point = start_point.split(' ');
			
		var start_size = trg.getAttribute('data-start_size');
		if(!start_size) trg.setAttribute('data-start_size', (start_size = trg.parentNode.offsetWidth + ' ' + trg.parentNode.offsetHeight));
		start_size = start_size.split(' ');
		
		// новоая ширина, но не менее минимальной у окна если задана
		var new_width = parseInt((trg.parentNode.currentStyle || window.getComputedStyle(trg.parentNode, null)).minWidth||'0');

		new_width = Math.max(new_width, parseInt(start_size[0]) + (ev_pageX||0) - parseInt(start_point[0]));
		
		var new_height = Math.max(0, parseInt(start_size[1]) + (ev_pageY||0) - parseInt(start_point[1]));

		// старый или новый обработчик?
		ev.fieldsets_found = trg.parentNode.getElementsByTagName('FIELDSET');
	}
	
	// [winresize] ?
	if(ev.type == 'winresize' /*&& trg1.className.indexOf('win-resizer') > -1*/) {
		var parent_div = trg1;
		var new_width = ev.width || ev.new_width || parseInt(parent_div.style.width || (parent_div.offsetWidth+''));
		var new_height = ev.height || ev.new_height || parseInt(parent_div.style.height || (parent_div.offsetHeight+''));
		
		// старый или новый обработчик?
		ev.fieldsets_found = trg1.getElementsByTagName('FIELDSET');
	}
	
	// [winresize] OLD
	if((ev.type == 'winresize' || ev.type == 'mousemove') &&
		('fieldsets_found' in ev && ev.fieldsets_found.length == 0)) {
		
		// соберём список видимых и подходящих строк окна
		var nodes = [];
		for(var i = 0; i < parent_div.childNodes.length; i++)
			if(parent_div.childNodes[i] == trg 
			|| parent_div.childNodes[i].style.display == 'none'
			|| parent_div.childNodes[i].className.indexOf('c-tabs-hidden_tab') > -1
			|| parent_div.childNodes[i].nodeType != 1) continue;
			else nodes.push(parent_div.childNodes[i]);
			
		var need_correct_width = false, flexible = 0;
		for(var ii = 0; ii < nodes.length; ii++) {
			var first_child = nodes[ii].firstElementChild;
			
			// уменьшим ширину, а потом проверим, не выпирает ли
			nodes[ii].style.width = new_width + 'px';
			if(first_child && first_child.offsetWidth > new_width) {
				new_width = first_child.offsetWidth;
				need_correct_width = true;
			}
			
			// учтём жёсткие высоты
			if(nodes[ii].getAttribute('data-win-row-height')) {
				new_height -= parseInt(nodes[ii].getAttribute('data-win-row-height'));
				if(!nodes[ii].style.height) nodes[ii].style.height = nodes[ii].getAttribute('data-win-row-height') + 'px';
				continue;
			}
			
			// резиновые высоты
			flexible++;
			nodes[ii].style.height = '1px';
			if(first_child) new_height -= first_child.offsetHeight; 
		}
		
		// проставим резиновые высоты, и расчитам окончательную высоту
		var din_height = Math.max(0, new_height) / Math.max(flexible, 1);
		var final_height = 0;
		for(var ii = 0; ii < nodes.length; ii++) {
			var first_child = nodes[ii].firstElementChild;

			if(need_correct_width)
				nodes[ii].style.width = new_width + 'px';
			if( ! nodes[ii].getAttribute('data-win-row-height'))
				try { nodes[ii].style.height = (first_child.offsetHeight || 1) + din_height + 'px'; } 
				catch(e) { nodes[ii].style.height = 1 + din_height + 'px'; }
			final_height += nodes[ii].offsetHeight;
		}
		if(final_height == 0) 
			final_height = new_height;
			
		parent_div.style.width = new_width + 'px';
		parent_div.style.height = final_height + 'px';
	}
	
	// [winresize] NEW
	if((ev.type == 'winresize' || ev.type == 'mousemove') &&
		('fieldsets_found' in ev && ev.fieldsets_found.length > 0)) {
// console.log(ev);
	
		var win = parent_div;	
	
		// вычеслим текущий хеш из настроек привязок
		var current_hash = [];
		for(var i = 0; i < ev.fieldsets_found.length; i++)
			current_hash.push('['+i+']'+ev.fieldsets_found[i].getAttribute('data-win-relocations')||'(empty)');
		current_hash = current_hash.join('');
			
		// хеши не совпали или старого хеша/функции нет вообще, строим новую функцию обработки привязок
		if(current_hash != win['onresize_hash']) {
			
			// первыми идут обновления размера окна
			func_src = [
				'/* win */',
				'var win_delta_left = 0, win_delta_top = 0;',
				'var win_delta_right = new_width - parseInt(win.style.width);',
				'var win_delta_bottom = new_height - parseInt(win.style.height);',
				'win.style.width = new_width + "px";',
				'win.style.height = new_height + "px";'
			];
			var checklist = {
				win_delta_top: true, win_delta_right: true, 
				win_delta_bottom: true, win_delta_left: true};
			
			// Составляем список найденных привязок для обработки
			for(var i = 0; i < ev.fieldsets_found.length; i++) {
				var fieldset = ev.fieldsets_found[i];
				var relocations = fieldset.getAttribute('data-win-relocations')||'';
				fieldset.id = fieldset.id || (win.id+'_fieldset'+i);
			
				func_src.push(''); func_src.push('/* '+fieldset.id+' */');
				func_src.push('var '+fieldset.id+' = fieldsets['+i+'];');
				
				// TOP
				var reloc = relocations.match(/(top): *#?([0-9a-zA-Z_]+)[()]* +([a-z]+) *([.0-9]*)/);
				if(!reloc) { 
					func_src.push('var '+fieldset.id+'_delta_top = '+fieldset.id+'.force_delta_top || 0;');
					checklist[fieldset.id+'_delta_top'] = true;
				} else {
					checklist[fieldset.id+'_delta_top'] = [fieldset.id, reloc[1], reloc[2], reloc[3], reloc[4], reloc[5]];
				}
				
				// BOTTOM
				var reloc = relocations.match(/(bottom): *#?([0-9a-zA-Z_]+)[()]* +([a-z]+) *([.0-9]*)/);
				if(!reloc) { 
					func_src.push('var '+fieldset.id+'_delta_bottom = '+fieldset.id+'.force_delta_bottom || 0;');
					checklist[fieldset.id+'_delta_bottom'] = true;
				} else {
					reloc[0] = fieldset.id;
					checklist[fieldset.id+'_delta_bottom'] = [fieldset.id, reloc[1], reloc[2], reloc[3], reloc[4], reloc[5]];
				}
				
				// LEFT
				var reloc = relocations.match(/(left): *#?([0-9a-zA-Z_]+)[()]* +([a-z]+) *([.0-9]*)/);
				if(!reloc) { 
					func_src.push('var '+fieldset.id+'_delta_left = '+fieldset.id+'.force_delta_left || 0;');
					checklist[fieldset.id+'_delta_left'] = true;
				} else {
					reloc[0] = fieldset.id;
					checklist[fieldset.id+'_delta_left'] = [fieldset.id, reloc[1], reloc[2], reloc[3], reloc[4], reloc[5]];
				}
				
				// RIGHT
				var reloc = relocations.match(/(right): *#?([0-9a-zA-Z_]+)[()]* +([a-z]+) *([.0-9]*)/);
				if(!reloc) { 
					func_src.push('var '+fieldset.id+'_delta_right = '+fieldset.id+'.force_delta_right || 0;');
					checklist[fieldset.id+'_delta_right'] = true;
				} else {
					reloc[0] = fieldset.id;
					checklist[fieldset.id+'_delta_right'] = [fieldset.id, reloc[1], reloc[2], reloc[3], reloc[4], reloc[5]];
				}
			}
			
			// начинаем расчитывать привязки по мере разрешения зависимостей
			for(var prt_cnt = 1; prt_cnt < 10; prt_cnt++) {
				func_src.push(''); func_src.push('/* '+prt_cnt+' */');
				
				var been_processed = 0;
				for(var f in checklist) if(checklist[f] != true) {
					var fieldset_id = checklist[f][0];
					
					// TOP
					if(checklist[f][1] == 'top') {
						var reloc_target = checklist[f][2]+'_delta_'+(checklist[f][3]||'bottom');
						
						// пропускаем если ещё не посчитан элемент к которому привязываемся
						if(checklist[reloc_target] != true) continue; 
						
						// посчитаем нашу делту от делты привязываемого
						func_src.push('var '+f+' = '+fieldset_id+'.force_delta_top || ('+reloc_target+' * '+parseFloat(checklist[f][4]||'1.0')+');');

						// устанавливаем новую высоту
						func_src.push(fieldset_id+'.style.top = parseFloat('+fieldset_id+'.style.top||'+fieldset_id+'.offsetTop+".0") + '+f+'+"px";');
						
						// отмечаем, что расчитали
						checklist[f] = true;
						been_processed++;
					}
					
					// BOTTOM
					else if(checklist[f][1] == 'bottom') {
						var reloc_target = checklist[f][2]+'_delta_'+(checklist[f][3]||'top');
						var fieldset_top = checklist[f][0]+'_delta_top';
						
						// пропускаем если ещё не посчитан элемент к которому привязываемся
						// и наш top т.к. надо будет его вычесть из высоты
						if(checklist[reloc_target] != true) continue; 
						if(checklist[fieldset_top] != true) continue; 
						
						// посчитаем нашу делту от делты привязываемого
						func_src.push('var '+f+' = '+fieldset_id+'.force_delta_bottom || ('+reloc_target+' * '+parseFloat(checklist[f][4]||'1.0')+');');
						
						// устанавливаем новую высоту
						func_src.push(fieldset_id+'.style.height = parseFloat('+fieldset_id+'.style.height||'+fieldset_id+'.offsetHeight+".0") + '+f+' - '+fieldset_top+' + "px";');
						
						// отмечаем, что расчитали
						checklist[f] = true;
						been_processed++;
					}
					
					// LEFT
					else if(checklist[f][1] == 'left') {
						var reloc_target = checklist[f][2]+'_delta_'+(checklist[f][3]||'right');
						
						// пропускаем если ещё не посчитан элемент к которому привязываемся
						if(checklist[reloc_target] != true) continue; 
						
						// посчитаем нашу делту от делты привязываемого
						func_src.push('var '+f+' = '+fieldset_id+'.force_delta_left || ('+reloc_target+' * '+parseFloat(checklist[f][4]||'1.0')+');');

						// устанавливаем новую высоту
						func_src.push(fieldset_id+'.style.left = parseFloat('+fieldset_id+'.style.left||'+fieldset_id+'.offsetLeft+".0") + '+f+'+"px";');
						
						// отмечаем, что расчитали
						checklist[f] = true;
						been_processed++;
					}
					
					// RIGHT
					else if(checklist[f][1] == 'right') {
						var reloc_target = checklist[f][2]+'_delta_'+(checklist[f][3]||'left');
						var fieldset_left = checklist[f][0]+'_delta_left';
						
						// пропускаем если ещё не посчитан элемент к которому привязываемся
						// и наш top т.к. надо будет его вычесть из высоты
						if(checklist[reloc_target] != true) continue; 
						if(checklist[fieldset_left] != true) continue; 
						
						// посчитаем нашу делту от делты привязываемого
						func_src.push('var '+f+' = '+fieldset_id+'.force_delta_right || ('+reloc_target+' * '+parseFloat(checklist[f][4]||'1.0')+');');
						
						// устанавливаем новую высоту
						func_src.push(fieldset_id+'.style.width = parseFloat('+fieldset_id+'.style.width||'+fieldset_id+'.offsetWidth+".0") + '+f+' - '+fieldset_left+' + "px";');
						
						// отмечаем, что расчитали
						checklist[f] = true;
						been_processed++;
					} 
					
					// неизвестный парамтр ???
					else {
						debugger;
					}
					
					func_src.push('');
				}
				
				// еси нечего не обработали, то обрабатывать нечего
				if(been_processed == 0) break;
			}
			
			win.onresize_func = new Function('win, new_width, new_height, fieldsets', func_src.join('\n'));
			win.onresize_hash = current_hash;
// console.log(win.onresize_hash, func_src.join('\n'));

		}
		
		if(win.onresize_func)
			win.onresize_func(win, new_width, new_height, ev.fieldsets_found);
	}
	
	// [winresize] settings
	if(ev.type == 'winresize') {
		// сохраним параметры окна, если указано где
		if(parent_div.getAttribute('data-win-settings-inLocalStorage')) {
			var key = ev.trg.parentNode.getAttribute('data-win-settings-inLocalStorage');
			var win_settings = JSON.parse(localStorage[key]||'{}') || {};
			win_settings.height = parseInt(ev.trg.parentNode.style.height);
			win_settings.width = parseInt(ev.trg.parentNode.style.width);
			localStorage[key] = JSON.stringify(win_settings);
		}
	}

	// .win-close-btn, .win-close-button
	if(ev.type == 'mouseup' && (trg1.className.indexOf('win-close-btn') > -1 || trg1.className.indexOf('win-close-button') > -1)) {
		var trg = trg1.parentNode;
		while(trg.parentNode.className.indexOf('win') > -1) trg = trg.parentNode;
		
		return html_onmouse({type:'winclose', target: trg});
	}
	
	// .win-minimize-btn, .win-minimize-button
	if(ev.type == 'mouseup' && (trg1.className.indexOf('win-minimize-btn') > -1 || trg1.className.indexOf('win-minimize-button') > -1)) {
		var trg = trg1.parentNode;
		while(trg.parentNode.className.indexOf('win') > -1) trg = trg.parentNode;
		trg.style.display = "none";
	}

	// [wincreate]
	if(ev.type == 'wincreate') {
		var html = [ev.innerHTML||''];
		for(var i = 0; i < (ev.header_rows||[]).length; i++) {
			if(ev.header_rows[i].match(/[" ]?win-row[" ]/))
				html.push('<div class="win-row-wrp type_caption g-draggable-parent">'+ev.header_rows[i]+'</div>');
			else
				html.push('<div class="win-row-wrp type_caption g-draggable-parent"><div class="win-row g-draggable-parent2">'+ev.header_rows[i]+'</div></div>');
		}
		
		for(var i = 0; i < (ev.rows||[]).length; i++) {
			if(ev.rows[i].match(/[" ]?win-row-wrp[" ]/))
				html.push(ev.rows[i]);
			else if(ev.rows[i].match(/[" ]?win-row[" ]/))
				html.push('<div class="win-row-wrp">'+ev.rows[i]+'</div>');
			else
				html.push('<div class="win-row-wrp"><div class="win-row">'+ev.rows[i]+'</div></div>');
		}
		
		for(var i = 0; i < (ev.rows_footer||[]).length; i++) {
			if(ev.rows_footer[i].match(/[" ]?win-row[" ]/))
				html.push('<div class="win-row-wrp type_footer">'+ev.rows_footer[i]+'</div>');
			else
				html.push('<div class="win-row-wrp type_footer"><div class="win-row">'+ev.rows_footer[i]+'</div></div>');
		}
		
		if((ev.rows||[]).length == 0)
			html[html.length-1] = html[html.length-1].replace(/win-row-wrp/, 'win-row-wrp no_body');
			
		
		if((ev['resizer']||ev['resize']||ev['resizable']) != false)
			html.push('<div class="win-resizer"></div>');

		var win = document.createElement('DIV');
		win.id = ev.id||('win'+(new Date)*1);
		win.style.display = 'none';
		win.className = 'win g-draggable';
		win.innerHTML = html.join('');
		
		if(ev.attributes)
		for(var attr_name in ev.attributes) {
			win.setAttribute(attr_name, ev.attributes[attr_name]);
		}
		
		if('width' in ev) win.style.width = ev.width + 'px';
		if('height' in ev) win.style.height = ev.height + 'px';
		
		document.body.appendChild(win);
	}
	
	// [winshow]
	if(ev.type == 'winshow') {
		if(trg1.style.display != 'block')
			trg1.style.display = 'block';
		
		if(!ev['position'] || ev.position == 'center' || ev.position == 'center center') {
			trg1.style.left = (window.innerWidth - trg1.offsetWidth) / 2 + 'px';
			trg1.style.top = (window.innerHeight - trg1.offsetHeight) / 2 + 'px';
		}
		
		if(ev['with_background']) {
			var cover = document.getElementById('win_backcover') || document.createElement('DIV');
			cover.style.cssText = 'height: 100%;left:0;position:fixed;top:0;width:100%;z-index: 98;background:'+(typeof ev['with_background'] == 'boolean' ? 'rgba(0, 0, 0, 0.7)' : ev['with_background']);
			
			if( ! cover.id) {
				cover.id = 'win_backcover';
				document.body.appendChild(cover);
			}
		}
	}
	
	// [winremove]
	if(' windestroy windelete winremove winclose'.indexOf(ev.type) > -1 && trg1.className.indexOf('win') > -1) {
		trg1.style.display = 'none';
		trg1p.removeChild(trg1);
		
		var win_backcover = document.getElementById('win_backcover')
		if(win_backcover)
			win_backcover.parentNode.removeChild(win_backcover);
	}
		
	
	// отклуючаем любые перетаскивания и включаем обратно выделения
	if(ev.type == 'mouseup' || ev.type == 'mouseout-window') {
		for(var f in html_onmouse.cursor)
			if(f.indexOf('dragging_') === 0)
				delete html_onmouse.cursor[f];
			
//		document.ondragstart = null;
		document.body.onselectstart = null; // IE8
	}
	// расширения
	for (var i in html_onmouse.extensions)
	if(html_onmouse.extensions[i] instanceof Function)
		html_onmouse.extensions[i](ev, trg1, trg1p, trg1p.parentNode, find_near);
	
	// для совместимости со старым кодом
// 	return window.html_onmouse_custom ? html_onmouse_custom(ev, trg1, trg1p, trg1p.parentNode, find_near) : undefined;
}

/* install html_onmouse events (if first load) */
if(!html_onmouse.extensions) {
	html_onmouse.extensions = [];
	html_onmouse.cursor = {};
	
	document.documentElement.addEventListener("mousedown", html_onmouse);
	document.documentElement.addEventListener("mousemove", html_onmouse);
	document.documentElement.addEventListener("mouseup", html_onmouse);
	document.documentElement.addEventListener("mouseout", html_onmouse);
	document.documentElement.addEventListener("mouseover", html_onmouse);
}

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