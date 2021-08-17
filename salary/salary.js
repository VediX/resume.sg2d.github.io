"use strict";

import SGModel from "./../res/sg-model/sg-model.js";

class Salary extends SGModel {
	
	static defaultProperties = {
		contract: 1,
		level: 4,
		days_in_week: 5,
		hours_in_day: 4,
		relocation: false,
		code_startup: false,
		code_supported: true,
		code_legacy: false,
		es5_nodejs: false,
		vue: false,
		react: false,
		php: false,
		pixijs: false,
		super_interesting: false
	};
	
	static typeProperties = {
		contract: SGModel.TYPE_NUMBER,
		level: SGModel.TYPE_NUMBER,
		days_in_week: SGModel.TYPE_NUMBER,
		hours_in_day: SGModel.TYPE_NUMBER,
		relocation: SGModel.TYPE_BOOLEAN,
		code_startup: SGModel.TYPE_BOOLEAN,
		code_supported: SGModel.TYPE_BOOLEAN,
		code_legacy: SGModel.TYPE_BOOLEAN,
		es5_nodejs: SGModel.TYPE_BOOLEAN,
		vue: SGModel.TYPE_BOOLEAN,
		react: SGModel.TYPE_BOOLEAN,
		php: SGModel.TYPE_BOOLEAN,
		pixijs: SGModel.TYPE_BOOLEAN,
		super_interesting: SGModel.TYPE_BOOLEAN
	};
	
	static bindPropertiesToDOM = {
		contract: "#contract",
		level,
		days_in_week,
		hours_in_day,
		relocation,
		code_startup,
		code_supported,
		code_legacy,
		es5_nodejs,
		vue,
		react,
		php,
		pixijs,
		super_interesting
	};
	
	static HOUR_RATE_BASE = 500;
	static HOUR_RATE_MIN = 500;
	static RELOCATION_MONTH_MIN = 350000;
	
	static CONTRACT_KOEF = [1, 1.5, 1.75, 2, 2.25];
	static LEVEL_KOEF = [0.5, 0.75, 0.9, 1, 1.25, 1.5];
	static DAYS_IN_WEEK_KOEF = [0.9, 0.925, 0.95, 0.975, 1, 1.25, 2];
	static RELOCATION_KOEF = 2;
	static CODE_SUPPORTED_KOEF = 1.1;
	static CODE_LEGACY_KOEF = 2;
	static ES5_NODEJS_KOEF = 0.95;
	static REACT_KOEF = 1.05;
	static PHP_KOEF = 1.1;
	static PIXIJS_KOEF = 0.9;
	static SUPER_INTERESTING_KOEF = 0.75;
	
	static fibonacci = [1,2,3,5,8,13,21,34];
	
	initialize() {
		
		document.querySelectorAll("li.dropdown-item").forEach((item)=>{
			item.onclick = this.dropdownItemClick;
		});
		
		let codeTypes = ["code_startup", "code_supported", "code_legacy"];
		this.on(codeTypes, ()=>{
			codeTypes.forEach(_name=>{
				var elem = document.querySelector("#"+_name);
				if (elem.checked) {
					elem.parentNode.classList.add("selected");
				} else {
					elem.parentNode.classList.remove("selected");
				}
			});
		});
		
		this.on("hours_in_day", (hours)=>{
			document.querySelector("#hours_in_day_desc").innerText = hours + " " + this.getHoursMeas(hours)+"/день";
		});
		
		document.querySelector("#rate_hour_min").innerHTML = this.getNumThinsp(Salary.HOUR_RATE_MIN);
		document.querySelector("#relocation_month_min").innerHTML = this.getNumThinsp(Salary.RELOCATION_MONTH_MIN);
		//document.querySelector("#send_offer").addEventListener("click", this.sendOffer);
		
		// Hash parser
		
		let parameters = location.hash.replace("#", "").split("&");
		for (var i = 0; i < parameters.length; i++) {
			parameters[i] = parameters[i].split("=");
			if (this.properties.hasOwnProperty(parameters[i][0])) {
				// this.set(parameters[i][0], parameters[i][1]); // TODO: сейчас форма не обновляется визуально!
			}
		}
		
		this.setOnAllCallback(this.calc, SGModel.FLAG_IMMEDIATELY);
	}
	
	dropdownItemClick() {
		let button = this.parentNode.parentNode.querySelector("button");
		button.value = this.dataset.value;
		button.innerHTML = this.innerHTML;
		button.dispatchEvent(new Event('change'));
	}
	
	calc() {
		let hours = 4 * this.get("days_in_week") * this.get("hours_in_day");
		let salary = this.constructor.fibonacci[this.get("hours_in_day") - 1] / this.get("hours_in_day")  * Salary.HOUR_RATE_BASE * hours;
		salary *= Salary.CONTRACT_KOEF[this.get("contract") - 1];
		salary *= Salary.LEVEL_KOEF[this.get("level") - 1];
		salary *= Salary.DAYS_IN_WEEK_KOEF[this.get("days_in_week") - 1];
		salary *= this.get("relocation") ? Salary.RELOCATION_KOEF : 1;
		salary *= this.get("code_supported") ? Salary.CODE_SUPPORTED_KOEF : 1;
		salary *= this.get("code_legacy") ? Salary.CODE_LEGACY_KOEF : 1;
		salary *= this.get("es5_nodejs") ? Salary.ES5_NODEJS_KOEF : 1;
		salary *= this.get("vue") ? Salary.ES5_NODEJS_KOEF : 1;
		salary *= this.get("react") ? Salary.REACT_KOEF : 1;
		salary *= this.get("php") ? Salary.PHP_KOEF : 1;
		salary *= this.get("pixijs") ? Salary.PIXIJS_KOEF : 1;
		salary *= this.get("super_interesting") ? Salary.SUPER_INTERESTING_KOEF : 1;
		
		if (this.get("relocation")) salary = Math.max(salary, Salary.RELOCATION_MONTH_MIN);
		
		let rate = Math.max(salary / hours, Salary.HOUR_RATE_MIN);
		
		salary = rate * hours;
		
		salary = SGModel.roundTo(salary, -2);
		document.querySelector("#salary_month").innerHTML = this.getNumThinsp(salary);
		document.querySelector("#salary_hour").innerHTML = this.getNumThinsp(SGModel.roundTo(rate, -1));
		document.querySelector("#hours").innerHTML = hours;
		document.querySelector("#hours_meas").innerText = this.getHoursMeas(hours);
	}
	
	getHoursMeas(h) {
		return "час" + this._getNoun(h, "", "а", "ов");
	}
	
	_getNoun(number, one, two, five) {
		let n = Math.abs(number);
		n %= 100;
		if (n >= 5 && n <= 20) return five;
		n %= 10;
		if (n === 1) return one;
		if (n >= 2 && n <= 4) return two;
		return five;
	}
	
	getNumThinsp(value) {
		return (''+value.toLocaleString()).replace(/\s/, "&thinsp;");
	}
	
	/*sendOffer() {
		debugger;
		Email.send({
			SecureToken: "todo",
			To: "_@_.ru",
			From: "_@sg2d.ru",
			Subject: "Offer from the salary constructor form",
			Body: "TODO..."
		}).then(
			message => console.log(message)
		);
	}*/
}

addEventListener("load", ()=>{ window.salaryApp = new Salary(); });