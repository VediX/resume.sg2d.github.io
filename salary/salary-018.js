"use strict";

class Salary extends SGModelView {
	
	static singleInstance = true;
	
	static defaultProperties = {
		initialized: false,
		
		contract: 2,
		level: 3,
		days_in_week: 5,
		hours_in_day: 4,
		relocation: false,
		code_startup: false,
		code_supported: true,
		code_legacy: false,
		es6: false,
		nodejs: false,
		vue3: false,
		react: false,
		angular: false,
		sapui5: false,
		php: false,
		cpp: false,
		typescript: false,
		pixijs: false,
		matterjs: false,
		sg2d: false,
		
		// скидки/наценки в %
		//contract_koef: [0,38,40,50,75,100], // TODO: ?
		code_supported_koef: 25,
		code_legacy_koef: 200,
		es6_koef: -5,
		nodejs_koef: -5,
		vue3_koef: -5,
		react_koef: 15,
		angular_koef: 25,
		sapui5_koef: 5,
		php_koef: 20,
		cpp_koef: 20,
		typescript_koef: 10,
		pixijs_koef: -5,
		matterjs_koef: -5,
		sg2d_koef: -50,
		
		rate_hour_min: 0,
		salary_month: 0,
		hours: 0,
		hours_meas: "",
		hours_in_day_desc: "",
		hours_extra_charge: 0,
		salary_hour: 0,
		salary_year: 0,
		
		options_expand: false
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
		es6: SGModel.TYPE_BOOLEAN,
		nodejs: SGModel.TYPE_BOOLEAN,
		vue3: SGModel.TYPE_BOOLEAN,
		react: SGModel.TYPE_BOOLEAN,
		angular: SGModel.TYPE_BOOLEAN,
		sapui5: SGModel.TYPE_BOOLEAN,
		php: SGModel.TYPE_BOOLEAN,
		cpp: SGModel.TYPE_BOOLEAN,
		typescript: SGModel.TYPE_BOOLEAN,
		pixijs: SGModel.TYPE_BOOLEAN,
		matterjs: SGModel.TYPE_BOOLEAN,
		sg2d: SGModel.TYPE_BOOLEAN,
		
		hours_extra_charge: SGModel.TYPE_NUMBER,
		
		options_expand: SGModel.TYPE_BOOLEAN
	};
	
	static hashProperties = {
		c: "contract",
		l: "level",
		d: "days_in_week",
		h: "hours_in_day",
		q: "relocation",
		x: "code_startup",
		y: "code_supported",
		z: "code_legacy",
		e: "es6",
		n: "nodejs",
		v: "vue3",
		r: "react",
		a: "angular",
		u: "sapui5",
		p: "php",
		o: "cpp",
		t: "typescript",
		i: "pixijs",
		m: "matterjs",
		s: "sg2d"
	};
	
	static HOUR_RATE_BASE = 667;
	static HOUR_RATE_MIN = 500;
	static RELOCATION_MONTH_MIN = 500000;
	
	static CONTRACT_LABOR = 1;
	static CONTRACT_SELF = 2;
	static CONTRACT_FREELANCE = 3;
	static CONTRACT_IP = 4;
	
	static CONTRACT_KOEF = [1.00, 1.50, 1.65, 2.00];
	static LEVEL_KOEF = [0.5, 0.75, 0.9, 1, 1.25, 1.5];
	static DAYS_IN_WEEK_KOEF = [0.5, 0.6, 0.7, 0.8, 1, 2, 4];
	static RELOCATION_KOEF = 2;
	
	//static HOURS_KOEF = [1,2.25,3.5625,5,7.8122,11.2497,17.5,30]; // -20%, -10%, -5%, 0%, +25%, +50%, +100%, +200%
	//static HOURS_KOEF = [1.0625,2.25,3.5625,5,6.875,9.375,13.125,20]; // -15%, -10%, -5%, 0%, +10%, +25%, +50%, +100%
	//static HOURS_KOEF = [1.0625,2.25,3.5625,5,7.8125,11.25,15.3125,20]; // -15%, -10%, -5%, 0%, +25%, +50%, +75%, +100%
	static HOURS_KOEF = [0.85,1.8,2.85,4,6.25,9,12.25,16]; // -15%, -10%, -5%, 0%, +25%, +50%, +75%, +100%
	static HOURS_EXTRA_CHARGE = [];
	
	initialize() {
		
		for (var i = 0; i < Salary.HOURS_KOEF.length; i++) {
			Salary.HOURS_EXTRA_CHARGE[i] = (100 * (Salary.HOURS_KOEF[i] / (5 * (i+1) / 5) - 1)).toFixed(2);
		}
		
		let codeTypes = ["code_startup", "code_supported", "code_legacy"];
		this.on(codeTypes, (value, valuePrev, name)=>{
			codeTypes.forEach(_name=>{
				var elem = document.querySelector("[sg-property="+_name+"]");
				if (name !== _name) {
					this.set(_name, false, void 0, SGModelView.FLAG_NO_CALLBACKS);
				}
				if (this.get(_name)) {
					elem.parentNode.classList.add("selected");
				} else {
					elem.parentNode.classList.remove("selected");
				}
			});
		});
		
		this.on("hours_in_day", (hours)=>{
			this.set("hours_in_day_desc", (hours == 8 ? "Фуллтайм" : hours + " " + this.getHoursMeas(hours)+"/день")); // TODO: надписи вытащить в шаблон?
			this.set("hours_extra_charge", Salary.HOURS_EXTRA_CHARGE[hours - 1]);
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.on("hours", (hours)=>{
			this.set("hours_meas", this.getHoursMeas(hours));
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.set("rate_hour_min", Salary.HOUR_RATE_MIN);
		this.set("relocation_month_min", Salary.RELOCATION_MONTH_MIN);
		
		let eRelocationLabel = document.querySelector("#relocation_label");
		eRelocationLabel.title = eRelocationLabel.title.replace("%relocation_month_min%", Salary.RELOCATION_MONTH_MIN);
		
		this.bindHTML("body");
		
		// Hash parser
		let param, parameters = location.hash.matchAll && location.hash.matchAll(/(\w)(\d)/g);
		if (parameters) {
			while (param = parameters.next(), ! param.done) {
				var code = param.value[1].toLowerCase();
				var value = param.value[2];
				var name = Salary.hashProperties[code];
				if (name) {
					this.set(name, value);
				}
			}
		}
		
		this.on(Object.values(Salary.hashProperties), this.calc, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.set("initialized", true);
	}
	
	static _fields_koef = ["code_supported","code_legacy","es6","nodejs","vue3","react","angular","sapui5","php","cpp","typescript","pixijs","matterjs","sg2d"];
	
	calc() {
		let hours = 4 * this.get("days_in_week") * this.get("hours_in_day");
		this.set("hours", hours);
		let salary = this.constructor.HOURS_KOEF[this.get("hours_in_day") - 1] / this.get("hours_in_day")  * Salary.HOUR_RATE_BASE * hours;
		salary *= Salary.CONTRACT_KOEF[this.get("contract") - 1];
		salary *= Salary.LEVEL_KOEF[this.get("level") - 1];
		salary *= Salary.DAYS_IN_WEEK_KOEF[this.get("days_in_week") - 1];
		salary *= this.get("relocation") ? Salary.RELOCATION_KOEF : 1;
		for (var i = 0; i < Salary._fields_koef.length; i++) {
			var name = Salary._fields_koef[i];
			salary *= this.get(name) ? this.perToNormal(this.get(name+"_koef")) : 1;
		}
		
		if (this.get("relocation")) salary = Math.max(salary, Salary.RELOCATION_MONTH_MIN);
		
		let rate = Math.max(salary / hours, Salary.HOUR_RATE_MIN);
		
		salary = rate * hours;
		
		salary = SGModel.roundTo(salary, -3);
		this.set("salary_hour", SGModel.roundTo(rate, -1));
		this.set("salary_month", salary);
		this.set("salary_year", this.get("salary_month") * (this.get("contract") === Salary.CONTRACT_LABOR ? 12 : 11));
	}
	
	perToNormal(value) {
		return (value/100 + 1);
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
	
	formatHoursExtraCharge(value) {
		if (value < 0) {
			return "(" + value + "%)";
		} else if (value > 0) {
			return "(+" + value + "%)";
		} else {
			return "";
		}
	}
	
	formatDiscount(value) {
		if (value) {
			return "(" + (value>0?"+":"")+value + "%)";
		} else {
			return "";
		}
	}
	
	cssDangerOrSuccess(propertyOrValue) {
		// TODO: property с []
		let value = (typeof propertyOrValue === "string" ? this.get(propertyOrValue) : propertyOrValue);
		if (value == 0) return ""; else return value < 0 ? "text-success" : "text-danger";
	}
	
	toggleOptions() {
		this.set("options_expand", ! this.get("options_expand"));
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
	
	saveLink() {
		var hash = [];
		for (var code in Salary.hashProperties) {
			var name = Salary.hashProperties[code];
			var value = this.properties[name];
			if (value === false) continue;
			if (value === true) value = 1;
			hash.push(code.toUpperCase() + value);
		}
		let href = location.href.replace(/#.*/, "") + "#" + hash.join("");
		let link_input = document.querySelector("#link_link");
		link_input.value = href;
	}
	
	sendEmail(event) {
		window.open("mailto:offer@sg2d.ru?subject="+event.currentTarget.dataset.subject+
			"&body="+event.currentTarget.dataset.body
				.replace("%hours_in_day%", this.get("hours_in_day"))
				.replace("%salary_hour%", this.get("salary_hour"))
				.replace("%link%", document.querySelector("#link_link").value));
	}
	
	linkCopy() {
		let link_input = document.querySelector("#link_link");
		link_input.select();
		try {
			let bSuccess = document.execCommand('copy');
			console.log('Copying link command was ' + (bSuccess ? 'successful' : 'unsuccessful'));
		} catch (err) {
			console.log('Oops, unable to copy');
		}
		return false;
	}
}

addEventListener("load", ()=>{ window.salaryApp = new Salary(); });