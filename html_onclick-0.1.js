/* 
 * html_onclick - JavaScript library for extend HTML and create widgets such as dropdown menu, counters, tabs, editable fields...
 * 
 * Version: 0.1
 * License: MIT
 * 
 *  Copyright (c) 2013-2015 Saemon Zixel, http://saemonzixel.ru/
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
	var ev = (typeof event == 'string') 
		? {type: event.split('.')[1], target: document.getElementById(event.split('.')[0])} 
		: (event || window.event);
	var trg1 = ev.target || ev.srcElement || document.body.parentNode;
	if (trg1.nodeType && trg1.nodeType == 9) trg1 = trg1.body.parentNode; // #document
	if (trg1.nodeType && trg1.nodeType == 3) trg1 = trg1.parentNode; // #text
	var trg1p = (trg1.parentNode && trg1.parentNode.nodeType != 9) ? trg1.parentNode : {className:'',nodeName:''};
	var trg1pp = (trg1p.parentNode && trg1p.parentNode.nodeType != 9) ? trg1p.parentNode : {className:'',nodeName:''};
	if(navigator.userAgent.indexOf('SZ/1') > 0) console.log(ev); // для отладки

	// поддержка onouterclick
	if(outer_click_hooks.length && ev.type == 'click') {
		var save_click_hooks = [];
		for(var i = 0; i < outer_click_hooks.length; i++)
			if(outer_click_hooks[i](event, trg1))
				save_click_hooks.push(outer_click_hooks[i]);
		outer_click_hooks = save_click_hooks;
	}
	
	if('className' in trg1 == false || !trg1.className['indexOf']) return;
	
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
		
		// найдём корневой node в блоке
		for(; root.parentNode.className.indexOf(prefix1) > -1; root = root.parentNode);
		
		if(root.className.match(regexp)) return root;
		
		var nodes = root.getElementsByTagName('*');
		for(var i=0; i<nodes.length; i++)
			if(nodes[i].className && nodes[i].className.indexOf(class_name) > -1 && nodes[i].className.match(regexp)) 
				return nodes[i];
			
		return if_not_found_return;
	}
	
	function find_all_near(class_name, if_not_found_return, start_node, prefix) {
		// определим префикс блока
		if(!prefix && (prefix = class_name.indexOf('!')+1) > 0) { 
			var prefix1 = class_name.substring(0, prefix-1);
			class_name = prefix1 + class_name.substring(prefix);
		} else
			var prefix1 = prefix || class_name.replace(/^([a-z]+-[^-]+).*$/, '$1');
		var regexp = new RegExp(class_name+'( |$)','');
		
		// найдём корневой node в блоке
		for(var root = start_node || trg1; root.parentNode.className.indexOf(prefix1) > -1; root = root.parentNode);
		
		// пройдёмся по всем нодам и отберём подходящие
		var result = [];
		var nodes = root.getElementsByTagName('*');
		for(var i=0; i<nodes.length; i++)
			if(nodes[i].className && nodes[i].className.indexOf(class_name) > -1 && nodes[i].className.match(regexp)) 
				result.push(nodes[i]);
			
		return result.length > 0 ? result : if_not_found_return;
	}
	
	// c-counter
	if(ev.type === 'click' && trg1.className.indexOf('c-counter') > -1) {
		var inp = find_near('c-counter-input');
		var min_value = inp.getAttribute('data-min_value') || 0;
		
		if(trg1.className.indexOf('c-counter-input') < 0)
		inp.value = isNaN(parseInt(inp.value)) ? min_value : parseInt(inp.value);
		
		if(trg1.className.indexOf('c-counter-dec') > -1) {
			inp.value = inp.value*1-1 < min_value ? min_value : inp.value*1 - 1;
		}
		if(trg1.className.indexOf('c-counter-inc') > -1) {
			inp.value = inp.value*1 + 1;
		}
		
		html_onclick({type:'input', target: inp});
		html_onclick({type:'change', target: inp});
		
		if(ev.preventDefault) ev.preventDefault();
		else event.returnValue = false;
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
						
					var radio = find_near_old(node, 'c-tabs-switcher-input_radio');
					if(radio) {
						if(node == trg1) radio.setAttribute('checked', 'checked');
						else radio.removeAttribute('checked');
						radio.checked = node == trg1;
					}
				}
						
				// c-tabs-tab
				if(active_tab && node.className.indexOf('c-tabs-tab') > -1) {
					node.style.display = node.className.indexOf('c-tabs-tab'+active_tab[1]) > -1 ? 'block' : 'none';
				}
			}
			
			// если ссылка, то отменим нажатие
			if(trg1.nodeName == 'A' || trg1p.nodeName == 'A')
				if(ev.preventDefault) ev.preventDefault();
				else ev.returnValue = false;
		}
	}

	// .c-image_viewer
	if(trg1.className.indexOf('c-image_viewer') > -1) {
		for(var root = trg1; 
			root.parentNode.className.indexOf('c-image_viewer') > -1 && root.parentNode; 
			root = root.parentNode);
		
		// находит все фотографии на показ и онформацию какая текущая, следующая и предыдущая
		function get_image_viewer_structure() {
			var curr_img = find_near('current_image', undefined, root, 'c-image_viewer'), curr_img_src = curr_img.src.replace(/http:\/\/[^/]+/, '');
			var imgs = find_all_near('c-image_viewer-preload-image', []), current_num = -1;
			for(var i=0; i<imgs.length; i++) {
				// наша фотография
				if(imgs[i].getAttribute('data-src') == curr_img_src) {
					current_num = i;
					break;
				}
			}
			
			// нет следующей - начинаем сначала
			if(current_num < 0 || current_num+1 >= imgs.length)
				var next_preload_img = imgs[0];
			else
				var next_preload_img = imgs[current_num+1];
			
			// нет предыдущей - продолжим с конца
			if(current_num < 1)
				var prev_preload_img = imgs[imgs.length-1];
			else
				var prev_preload_img = imgs[current_num-1];

			return {curr_img: curr_img, preview_imgs: imgs, 
				current_num: current_num,
				current_preload_img: imgs[current_num],
				next_preload_img: next_preload_img,
				next_next_preload_img: (current_num+2 >= imgs.length) ? imgs[0] : imgs[current_num+2],
				prev_preload_img: prev_preload_img
			}
		}
		
		if(ev.type == 'load' && trg1.className.indexOf('c-image_viewer-image') > -1) {
			var size = trg1.getAttribute('data-original-size').match(/([0-9]+)x([0-9]+)/);
			
			// скорректируем размеры под окно броузера
			var max_width = window.innerWidth - 30;
			if(size[1] > max_width) {
				size[2] = Math.round(size[2] * (max_width / size[1]));
				size[1] = max_width;
			}

			var max_height = window.innerHeight - 30;
			if(size[2] > max_height) {
				size[1] = Math.round(size[1] * (max_height / size[2]));
				size[2] = max_height;
			}
			
/*			var center = {
				x: parseInt(root.style.left) + parseInt(root.style.width) / 2 + parseInt(root.style.padding||'0'),
				y: parseInt(root.style.top) + parseInt(root.style.height) / 2 + parseInt(root.style.padding||'0')
			}; */
			var center = {
				x: Math.round(window.innerWidth / 2),
				y: Math.round(window.innerHeight / 2) + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
			};
			
			trg1.style.width = size[1]+'px'; // root.style.width;
			trg1.style.height = size[2]+'px'; // root.style.height;
			
			root.style.width = size[1]+'px';
			root.style.height = size[2]+'px';
			root.style.padding = '10px';
			root.style.left = (center.x - (size[1]*1) / 2 - parseInt(root.style.padding||'0'))+'px';
			root.style.top = (center.y - (size[2]*1) / 2 - parseInt(root.style.padding||'0'))+'px';
			root.className = root.className+' c-image_viewer-complete';
			/*var ease = 'ease-out';
			anim(trg1, 'width:'+size[1]+'px 0.3s '+ease);
			anim(trg1, 'height:'+size[2]+'px 0.3s '+ease, function(){ trg1.className = 'c-image_viewer-image'; });
			anim(root, 'width:'+size[1]+'px 0.3s '+ease);
			anim(root, 'height:'+size[2]+'px 0.3s '+ease);
			anim(root, 'padding: 10px 0.3s '+ease);
			anim(root, 'left: '+(center.x - (size[1]*1 + 20) / 2)+'px 0.3s '+ease);
			anim(root, 'top: '+(center.y - (size[2]*1 + 20) / 2)+'px 0.3s '+ease, function(){
				root.className = root.className+' c-image_viewer-complete';
			});*/
			
			return;
		}
		
		if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-btn-close') > -1 
			|| trg1.className == 'c-image_viewer-image') {
			if(trg1.parentNode.parentNode)
				trg1.parentNode.parentNode.removeChild(trg1.parentNode);

		} else
		if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-btn-next') > -1) {
			
			var struct = get_image_viewer_structure();
			
			// загрузем новую фотографию
			if(!!struct.next_preload_img) {
// 					root.className =  root.className.replace(/ *c-image_viewer-(complete|loading|inner_loading)/, '') + ' c-image_viewer-inner_loading';
// 					curr_img.className = "c-image_viewer-image c-image_viewer-image-loading";

				// уберём недоконца исчезнувшую предыдущую фотку если есть
				var prev_img = struct.curr_img.previousElementSibling;
				if(prev_img && prev_img.className.indexOf('hidding_image') > -1)
					prev_img.parentNode.removeChild(prev_img);

				var new_img = document.createElement('IMG');
				new_img.className = "c-image_viewer-image current_image";
				new_img.src = struct.next_preload_img.getAttribute('data-src');
				struct.curr_img.parentNode.insertBefore(new_img, struct.curr_img.nextElementSibling);
				struct.curr_img.className = struct.curr_img.className.replace(' current_image', '') + ' hidding_image';
				setTimeout(function(){ if(struct.curr_img.parentNode) struct.curr_img.parentNode.removeChild(struct.curr_img); }, 2000);
			}
			
			// запустим подготовку следующей фотографии
			html_onclick({type: 'start_preload', target: struct.next_next_preload_img});
			
		}/* else
		if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-btn-prev') > -1) {
			var curr_img = find_near('c-image_viewer-image'), curr_img_src = curr_img.src.replace(/http:\/\/[^/]+/, '');
			var imgs = find_all_near('c-image_viewer-preload-image', []), current_num = -1;
			for(var i=0; i<imgs.length; i++) {
				// наша фотография
				if(imgs[i].getAttribute('data-src') == curr_img_src) {
					current_num = i;
					break;
				}
			}
		} *//* else
		if(ev.type == 'click' && trg1.className.match(/c-image_viewer( |$)/)) {
			trg1.parentNode.removeChild(trg1);
		}*/
		
		//if(ev.type == 'click' && trg1.className.indexOf('c-image_viewer-switcher') > -1) 
		
		if(ev.type == 'start_preload' && trg1.className.indexOf('c-image_viewer-preload-image') > -1) {
			if(trg1.src.replace(/http:\/\/[^/]+/, '') != trg1.getAttribute('data-src')) {
				trg1.onload = function(){ this.className += ' state_loaded'; };
				trg1.onerror = function(){ this.className += ' state_error'; };
				trg1.src = trg1.getAttribute('data-src');
			}
		}
		
		if(ev.type == 'start_as_slideshow') {
			var struct = get_image_viewer_structure();
			html_onclick({type: 'start_preload', target: struct.next_preload_img });

			// запустим таймеры смены слайдов
			setTimeout(function(){ 
				html_onclick({type: 'click', target: find_near('c-image_viewer-btn-next') }); 
				setInterval(function(){ 
					html_onclick({type: 'click', target: find_near('c-image_viewer-btn-next') }); 
				}, 6000);
			}, 4000);
		}
		//if(ev.type == 'finish_switching' && trg1.className.indexOf('c-image_viewer-next_image'))
	}
	
	// g-show-full-in-popup
	if(ev.type == 'click' && (trg1.className.indexOf('g-show-full-in-popup') > -1 
		|| trg1p.className.indexOf('g-show-full-in-popup') > -1)) {
		
		var trg = trg1.nodeName == 'A' ? trg1 : trg1p;
		
		// удалим текущий вьюер
		var viewer = document.getElementById('c_image_viewer_popup'); 
		if(viewer) viewer.parentNode.removeChild(viewer);

		var trg1_offset = trg.getBoundingClientRect();
		var left = Math.round(trg1_offset.left) + (window.pageXOffset||document.documentElement.scrollLeft||0);
		var top = Math.round(trg1_offset.top) + (window.pageYOffset||document.documentElement.scrollTop||0);
		var width = trg.offsetWidth;
		var height = trg.offsetHeight;

		// конструируем вьюер
		var viewer = document.createElement('DIV');
		viewer.id = 'c_image_viewer_popup';
		viewer.className ="c-image_viewer c-image_viewer-popup c-image_viewer-loading";
		viewer.style.cssText = 'left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;';
// 		viewer.onclick = c_image_viewer_onevent;
		
		viewer.appendChild(document.createElement('IMG'));
		viewer.lastChild.className = "c-image_viewer-image c-image_viewer-image-loading";
		viewer.lastChild.onload = function(event){
			this.parentNode.className = this.parentNode.className.replace(/c-image_viewer-(loading|inner_loading)/, '');
			this.className = 'c-image_viewer-image c-image_viewer-image-loaded';
			this.style.width = this.style.height = 'auto';
			this.setAttribute('data-original-size', this.offsetWidth+'x'+this.offsetHeight);
			c_image_viewer_onevent({target: this, type: 'load'});
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
		if(trg.className.indexOf('bxslider-link') > -1) {
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
		return false;
	}
	
	// g-show-this-into-...
	if(trg1.className.indexOf('g-show-this-into-') > -1 || trg1p.className.indexOf('g-show-this-into-') > -1) {
		var tmp = trg1.className.match(/g-show-this-into-([^ ]+)/) || trg1p.className.match(/g-show-this-into-([^ ]+)/);
		var trg = document.getElementById(tmp[1]);
		/*if(trg && trg.className.indexOf('b-slideshow') > -1) {
			var href = (trg1.href || trg1p.href).replace(/http:\/\/[^/]+/, '');
			var nodes = trg.firstChild.getElementsByTagName('div');
			for(var i = 0; i < nodes.length; i++)
				if(nodes[i].title == href) {
					nodes[i].className = nodes[i].className + ' b-slideshow-need-to-show';
					html_onclick({target: trg});
					break;
				}
		} */
		
		// отменим переход
		if(trg1.nodeName == 'A' || trg1p.nodeName == 'A')
			if(ev.preventDefault) ev.preventDefault();
			else event.returnValue = false;
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
	
	// вызавим стандартный обработчик в конце
	if(ev.type == 'input' && trg1.getAttribute('oninput')) {
		(new Function('event', trg1.getAttribute('oninput'))).call(trg1, ev);
	}
	
	// на случай если нас вызвали вручную
	if(ev['stopPropagation'])
		ev.stopPropagation();
	else
		ev.cancelBubble = true;
	
	// старый обработчик
	if(old_html_onclick) return old_html_onclick(ev);
}
    
var old_html_onclick = document.documentElement.onclick;
document.documentElement.onclick = html_onclick;
