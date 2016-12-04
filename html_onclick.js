/* 
 * html_onclick - JavaScript library for extend HTML and create widgets such as dropdown menu, counters, tabs, editable fields...
 * 
 * Version: 0.2
 * License: MIT
 * 
 *  Copyright (c) 2013-2016 Saemon Zixel, http://saemonzixel.ru/
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software *  and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

var outer_click_hooks = [];
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
	
	// [outerclick] event
    if (outer_click_hooks.length && ev.type == 'click') {
        var save_click_hooks = [];
        for (var i = 0; i < outer_click_hooks.length; i++)
            if (outer_click_hooks[i](event, trg1))
                save_click_hooks.push(outer_click_hooks[i]);
        outer_click_hooks = save_click_hooks;
    }
	
	// g-show_hide-by_id-*
	if(trg1.className.indexOf('g-show_hide-by_id') > -1) {
		var id = trg1.className.match(/g-show_hide-by_id-([-0-9a-zA-Z_]+)/);
		var elem = document.getElementById(id[1]);
		if(elem && elem.style.display == 'none') {
			elem.style.display = 'block';
			if(elem.getAttribute('onshow'))
				(new Function('event', elem.getAttribute('onshow'))).call(trg1, ev);
		} else
		if(elem && elem.style.display != 'none') {
			elem.style.display = 'none';
			if(elem.getAttribute('onhide'))
				(new Function('event', elem.getAttribute('onhide'))).call(trg1, ev);
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
/*    if(trg1.className.indexOf('b-photo_changer') > -1
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
*/
				
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
				
/*				if(ev.preventDefault) ev.preventDefault();
				else ev.returnValue = false;
			}
		}
	}*/
    
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
		outer_click_hooks.push(function(event){ 
		
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
		outer_click_hooks.push(function(event, trg){ 
			if(trg == inp || now > (new Date())*1) return true;
			if(inp.value == '' && trg1.getAttribute('data-value-if-empty'))
				trg1.innerHTML = trg1.getAttribute('data-value-if-empty');
			else if(trg1.className.indexOf('type_float') > -1)
				trg1.innerHTML = stringToMoney(inp.value);
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
		outer_click_hooks.push(function(event, trg){ 
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

		outer_click_hooks.push(function(event, target){ 
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
			
		outer_click_hooks.push(function(ev1, trg){
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
	
	return window.html_onclick_custom ? html_onclick_custom(ev, trg1, trg1p, trg1pp, find_near) : undefined;
}

document.documentElement.onclick = html_onclick;
document.documentElement.oninput = html_onclick;

// old IE
document.onreadystatechange = function(event) {
	if(document.readyState != 'complete') return;
	html_onclick({type: 'DOMContentLoaded', target: document});
}

// all other
if(document.addEventListener)
	document.addEventListener("DOMContentLoaded", document.onreadystatechange);

// Спецефичные для сайта обработки
// function html_onclick_custom(ev, trg1, trg1p, trg1pp) {
// }

// функция оформления цены
function stringToMoney(string) {
	var price = (string+'').match(/([0-9]+)(\.([0-9]+))?/);
	if(999 < price[1])
		price[1] = price[1].toString().split('').reverse().join('').replace(/^(.)(.)(.)(.)(.)?(.)?(.)?(.)?(.)?$/, '$9$8$7&nbsp;$6$5$4&nbsp;$3$2$1&nbsp;').replace(/&nbsp;$/, '').replace(/^(&nbsp;)+/, '');
	return price[1];
}