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