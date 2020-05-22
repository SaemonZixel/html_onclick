# html_onclick
The JavaScript library for extending HTML and create a widgets such as dropdown menus, counters, tabs, editable fields, windows...


## c-tabs
```html
<div class="c-tabs">
	<div class="c-tabs-panel">
		<a class="c-tabs-switcher c-tabs-switch-to-tab--Tab1" href="#">Tab1</a>
		<a class="c-tabs-switcher c-tabs-switch-to-tab--Tab2" href="#">Tab2</a>
		<a class="c-tabs-switcher c-tabs-switch-to-tab--Tab3" href="#">Tab3</a>
	</div>
	<div class="c-tabs-tab--Tab1">
		Tab1 content
	</div>
	<div class="c-tabs-tab--Tab2">
		Tab2 content
	</div>
	<div class="c-tabs-tab--Tab3">
		Tab3 content
	</div>
</div>
```

## g-show-full-in-popup
```html
<a class="g-show-full-in-popup" href="photo.jpg">
	<img src="thumb.jpg" alt="">
</a>
```

## g-show-length-in-by_id
```html
<div>
	<input class="g-show-length-in-by_id-len1" type="text" value="string...">
	<span id="len1">9</span>
</div>
```

## g-editable-by-*
```html
<span class="g-editable-by-input">Same string...</span>
<p class="g-editable-by-textarea">Same text...</p>
<div class="g-editable-by-counter">123</div>
<div class="g-editable-by-checklist_menu" data-editable-menu_id="checklist_menu1">Option1</div>
<div class="g-editable-by-menu" data-editable-menu_id="dropdown_menu2">Option1</div>
```

## c-dropdown-checklist_menu
```html
<div id="checklist_menu1" class="c-dropdown-checklist_menu">
	<div class="c-dropdown-checklist_menu-item">
		<input class="c-dropdown-checklist_menu-checkbox" type="checkbox"> Option1
	</div>
	<div class="c-dropdown-checklist_menu-item">
		<input class="c-dropdown-checklist_menu-checkbox" type="checkbox"> Option2
	</div>
	<div class="c-dropdown-checklist_menu-item">
		<input class="c-dropdown-checklist_menu-checkbox" type="checkbox"> Option3
	</div>
</div>
```

## c-dropdown-menu
```html
<div id="dropdown_menu2" class="c-dropdown-menu">
	<div class="c-dropdown-menu-item">Option1</div>
	<div class="c-dropdown-menu-item">Option2</div>
	<div class="c-dropdown-menu-item">Option3</div>
</div>
```

## g-draggable
```html
<div class="g-draggable" style="width:50px;heigth:50px;background:red;"></div>
```

## win
```javascript
var win_html = ['<fieldset style="position:absolute;left:0;top:0;height:35px;width:460px;" class="win-header g-draggable-parent" data-win-relocations="right: win() right"><div class="win-header-title g-draggable-parent2">Test window</div> <a class="win-close-btn" href="javascript:void(0)">x</a></fieldset>'+
'<fieldset class="win-fieldset" style="position:absolute;left:20px;top:60px;height:55px;width:420px" data-win-relocations="right: win() right;bottom: win() bottom;">'+
'<textarea class="c-textarea" style="width:100%;height:100%;max-width:100%;max-height:100%;box-sizing:border-box">Test...</textarea>'+
'</fieldset>';

html_onmouse({
	type: 'wincreate',
	id: 'win1',
	attributes: {'data-win-settings-inLocalStorage': 'win1_saved_sizes'},
	resizable: true,
	width: 460, height: 135,
	innerHTML: win_html});

html_onmouse({
	type: 'winshow', 
	target: document.getElementById('win1')});
```
## extensions
```javascript
html_onclick.extensions.push(function(ev, trg1, trg1p, trg1pp, find_near){
	if (ev.type == 'click' && trg1.className.indexOf('my_element') > -1) {
		alert("click!");
	}
});

html_onmouse.extensions.push(function(ev, trg1, trg1p, trg1pp, find_near){
	if (ev.type == 'mouseup' && trg1.className.indexOf('my_element') > -1) {
		alert("mouseup!");
	}
});

html_onkey.extensions.push(function(ev, trg1, trg1p, trg1pp){
	if (ev.type == 'keyup' && trg1.className.indexOf('my_element') > -1) {
		alert("keyup!");
	}
});
```