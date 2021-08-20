/**
 * SGHTMLModel 1.0.0
 * Binder for SGModel (MVVM)
 * https://github.com/VediX/SGModel
 * (c) 2021 Kalashnikov Ilya
 * SGHTMLModel may be freely distributed under the MIT license
 */

"use strict";

import SGModel from "./sg-model.js";

export default class SGHTMLModel extends SGModel {
	
	set(name, value, options = void 0, flags = 0) {
		if (super.set.apply(this, arguments) && (this._binderInitialized)) {
			this._refreshElement(name);
		}
	}
	
	/**
	 * Perform Data and View Binding (MVVM)
	 * @param {string|HTMLElement} [root=void 0]
	 */
	bindHTML(root = void 0) {
		
		if (! this._binderInitialized) {
			if (typeof document === "undefined") throw "Error! document is undefined!";
			this._onChangeDOMElementValue = this._onChangeDOMElementValue.bind(this);
			this._elementsHTML = {};
			this._binderInitialized = true;
		}
		
		if (! root) root = document.body;
		if (typeof root === "string") root = document.querySelector(root);
		for (var name in this._elementsHTML) {
			this._elementsHTML[name].removeEventListener("change", this._onChangeDOMElementValue);
			this._elementsHTML[name].removeEventListener("input", this._onChangeDOMElementValue);
			delete this._elementsHTML[name];
		}
		this._bindElements([root]);
	}
	
	/** @private */
	_bindElements(elements) {
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			
			if (element.nodeType !== 1) continue;
			
			var sgProperty = element.getAttribute("sg-property");
			var sgType = element.getAttribute("sg-type");
			
			if (this.has(sgProperty)) {
				this._elementsHTML[sgProperty] = element;
				element._sg_property = sgProperty;
				element._sg_type = sgType;
				switch (sgType) {
					case "dropdown":
						var eItems = document.querySelectorAll("[sg-dropdown=" + sgProperty + "]");
						for (var i = 0; i < eItems.length; i++) {
							eItems[i].onclick = this._dropdownItemClick;
						}
						break;
				}
				var sEvent = (element.type === "range" ? "input" : "change");
				element.addEventListener(sEvent, this._onChangeDOMElementValue);
				this._refreshElement(sgProperty);
			}
			this._bindElements(element.children);
		}
	}
	
	/** @private */
	_refreshElement(name) {
		
		var element = this._elementsHTML[name];
		if (! element) return;
		
		var value = this.properties[name];
		
		switch (element._sg_type) {
			case "dropdown":
				var eItems = document.querySelectorAll("[sg-dropdown=" + name + "]");
				for (var i = 0; i < eItems.length; i++) {
					var sgValue = eItems[i].getAttribute("sg-value");
					if (sgValue == value) {
						element.value = value;
						element.innerHTML = eItems[i].innerHTML;
						break;
					}
				}
				break;
			default: {
				switch (element.type) {
					case "radio": case "checkbox": element.checked = value; break;
					case "range": case "text": case "button": element.value = value; break; // TODO case "select": 
				}
			}
		}
	}
	
	/** @private */
	_onChangeDOMElementValue(event) {
		let elem = event.currentTarget;
		switch (elem.type) {
			case "checkbox": this.set(elem._sg_property, elem.checked); break;
			case "radio":
				let radioButtons = document.querySelectorAll("input[name=" + elem.name+"]"); // TODO: limit the form tag if present
				for (var i = 0; i < radioButtons.length; i++) {
					var _elem = radioButtons[i];
					if (_elem.getAttribute("sg-property") !== elem.getAttribute("sg-property") && _elem._sg_property) {
						this.set(_elem._sg_property, _elem.checked);
					}
				}
				this.set(elem._sg_property, elem.checked);
				break;
			case "range": case "text": case "button": this.set(elem._sg_property, elem.value); break;
		}
	}
	
	_dropdownItemClick() {
		let button = this.parentNode.parentNode.querySelector("button");
		button.value = this.getAttribute("sg-value");
		button.innerHTML = this.innerHTML;
		button.dispatchEvent(new Event('change'));
	}
}

if (typeof exports === 'object' && typeof module === 'object') module.exports = SGHTMLModel;
else if (typeof define === 'function' && define.amd) define("SGHTMLModel", [], ()=>SGHTMLModel);
else if (typeof exports === 'object') exports["SGHTMLModel"] = SGHTMLModel;
else if (typeof window === 'object' && window.document) window["SGHTMLModel"] = SGHTMLModel;
else this["SGModel"] = SGHTMLModel;