"use strict";

class Salary extends SGModelView {
	
	static singleInstance = true;
	
	static defaultProperties = {
		initialized: false,
		
		contract: 1,
		level: 3,
		days_in_week: 5,
		hours_in_day: 4,
		relocation: false,
		code_startup: false,
		code_supported: true,
		code_supported_and_legacy: false,
		code_legacy: false,
		es8_node: false,
		//nodejs: false,
		//vue3: false,
		react: false,
		angular: false,
		sapui5: false,
		php: false,
		cpp: false,
		typescript: false,
		//pixijs: false,
		//matterjs: false,
		sg2d: false,
		
		// скидки/наценки в %
		//contract_koef: [0,38,40,50,75,100], // TODO: ?
		code_startup_koef: -25,
		code_supported_koef: 0,
		code_supported_and_legacy_koef: 100,
		code_legacy_koef: 200,
		es8_node_koef: -5,
		//nodejs_koef: -5,
		//vue3_koef: -5,
		react_koef: 15,
		angular_koef: 30,
		sapui5_koef: 5,
		php_koef: 20,
		cpp_koef: 25,
		typescript_koef: 10,
		//pixijs_koef: -5,
		//matterjs_koef: -5,
		sg2d_koef: -25,
		
		contract_labor_per: 0,
		contract_freelance_per: 0,
		contract_ip_per: 0,
		
		rate_hour_min: 0,
		salary_month: 0,
		hours: 0,
		hours_meas: "",
		hours_in_day_desc: "",
		hours_extra_charge: 0,
		salary_hour: 0,
		salary_year: 0,
		
		usdrub: 0,
		salary_month_usd: 0,
		salary_hour_usd: 0,
		
		salary_labor_fot: 0,
		salary_labor_ndfl: 0,
		salary_labor_insurance: 0,
		salary_labor_month: 0,
		salary_labor_year: 0,
		contract_self_limit: 0,
		self_benefit_percent: 0.0,
		
		options_expand: true,
		options_expand_icon: ""
	};
	
	static typeProperties = {
		contract: SGModel.TYPE_NUMBER,
		level: SGModel.TYPE_NUMBER,
		days_in_week: SGModel.TYPE_NUMBER,
		hours_in_day: SGModel.TYPE_NUMBER,
		relocation: SGModel.TYPE_BOOLEAN,
		code_startup: SGModel.TYPE_BOOLEAN,
		code_supported: SGModel.TYPE_BOOLEAN,
		code_supported_and_legacy: SGModel.TYPE_BOOLEAN,
		code_legacy: SGModel.TYPE_BOOLEAN,
		es8_node: SGModel.TYPE_BOOLEAN,
		//nodejs: SGModel.TYPE_BOOLEAN,
		//vue3: SGModel.TYPE_BOOLEAN,
		react: SGModel.TYPE_BOOLEAN,
		angular: SGModel.TYPE_BOOLEAN,
		sapui5: SGModel.TYPE_BOOLEAN,
		php: SGModel.TYPE_BOOLEAN,
		cpp: SGModel.TYPE_BOOLEAN,
		typescript: SGModel.TYPE_BOOLEAN,
		//pixijs: SGModel.TYPE_BOOLEAN,
		//matterjs: SGModel.TYPE_BOOLEAN,
		sg2d: SGModel.TYPE_BOOLEAN,
		
		contract_labor_per: SGModel.TYPE_NUMBER,
		contract_freelance_per: SGModel.TYPE_NUMBER,
		contract_ip_per: SGModel.TYPE_NUMBER,
		
		hours_extra_charge: SGModel.TYPE_NUMBER,
		
		salary_labor_fot: SGModel.TYPE_NUMBER,
		salary_labor_ndfl: SGModel.TYPE_NUMBER,
		salary_labor_insurance: SGModel.TYPE_NUMBER,
		salary_labor_month: SGModel.TYPE_NUMBER,
		salary_labor_year: SGModel.TYPE_NUMBER,
		contract_self_limit: SGModel.TYPE_NUMBER,
		self_benefit_percent: SGModel.TYPE_NUMBER,
		
		options_expand: SGModel.TYPE_BOOLEAN,
		options_expand_icon: SGModel.TYPE_STRING
	};
	
	static hashProperties = {
		c: "contract",
		l: "level",
		d: "days_in_week",
		h: "hours_in_day",
		q: "relocation",
		x: "code_startup",
		y: "code_supported",
		g: "code_supported_and_legacy",
		z: "code_legacy",
		e: "es8_node",
		//n: "nodejs",
		//v: "vue3",
		r: "react",
		a: "angular",
		u: "sapui5",
		p: "php",
		o: "cpp",
		t: "typescript",
		//i: "pixijs",
		//m: "matterjs",
		s: "sg2d"
	};
	
	//static HOUR_RATE_BASE = 1388.8888; // 100K 4h medium
	static HOUR_RATE_BASE = 1750; // 126K 4h medium (with ES8+/nodeJS 120K)
	//static HOUR_RATE_BASE = 2222.22222;
	static HOUR_RATE_MIN = 1250;
	static RELOCATION_MONTH_MIN = 500000;
	static CONTRACT_SELF_LIMIT = 2400000;
	
	static CONTRACT_SELF = 1;
	static CONTRACT_LABOR = 2;
	static CONTRACT_FREELANCE = 3;
	static CONTRACT_IP = 4;
	
	static NDFL = 0.13;
	static INSURANCE = 0.22 + 0.051+0.029 + 0.002;
	
	static CONTRACT_KOEF = [1.00, 1.50, 1.4, 2.00]; // SELF, LABOR, FREELANCE, IP
	static LEVEL_KOEF = [0.5, 0.75, 0.9, 1, 1.25, 1.5];
	static DAYS_IN_WEEK_KOEF = [0.5, 0.6, 0.7, 0.8, 1, 2, 4];
	static RELOCATION_KOEF = 2;
	
	//static HOURS_KOEF = [0.85,1.8,2.85,4,6.25,9,12.25,16]; // -15%, -10%, -5%, 0%, +25%, +50%, +75%, +100%
	static HOURS_KOEF = [0.85,1.8,2.85,4,5.5,7.2,9.1,11.20]; // -15%, -10%, -5%, 0%, +10%, +20%, +30%, +40%
	static HOURS_EXTRA_CHARGE = [];
	
	initialize() {
		
		this.checkDollarInRubles();
		
		this.set("contract_self_limit", Salary.CONTRACT_SELF_LIMIT);
		
		let fContractPer = (index) => { return (100 * (Salary.CONTRACT_KOEF[index - 1] - 1)).toFixed(0); };
		
		this.set("contract_labor_per", fContractPer(Salary.CONTRACT_LABOR));
		this.set("contract_freelance_per", fContractPer(Salary.CONTRACT_FREELANCE));
		this.set("contract_ip_per", fContractPer(Salary.CONTRACT_IP ));
		
		for (var i = 0; i < Salary.HOURS_KOEF.length; i++) {
			Salary.HOURS_EXTRA_CHARGE[i] = (100 * (Salary.HOURS_KOEF[i] / (5 * (i+1) / 5) - 1)).toFixed(2);
		}
		
		let codeTypes = ["code_startup", "code_supported", "code_supported_and_legacy", "code_legacy"];
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
		
		this.on("options_expand", (options_expand)=>{
			this.set("options_expand_icon", options_expand ? "&nbsp;&#9660;" : "...");
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
		
		this.on(Object.values(Salary.hashProperties), this.calc);//, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		this.on('usdrub', this.calc, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.set("initialized", true);
	}
	
	static _fields_koef = ["code_startup", "code_supported","code_supported_and_legacy", "code_legacy","es8_node","react","angular","sapui5","php","cpp","typescript","sg2d"];
	
	calc() {
		let hours = 4 * this.get("days_in_week") * this.get("hours_in_day");
		this.set("hours", hours);
		let salary = this.constructor.HOURS_KOEF[this.get("hours_in_day") - 1] / this.get("hours_in_day")  * Salary.HOUR_RATE_BASE * hours;
		salary *= Salary.CONTRACT_KOEF[this.get("contract") - 1];
		salary *= Salary.LEVEL_KOEF[this.get("level") - 1];
		salary *= Salary.DAYS_IN_WEEK_KOEF[this.get("days_in_week") - 1];
		
		let per = 100;
		for (var i = 0; i < Salary._fields_koef.length; i++) {
			var name = Salary._fields_koef[i];
			if (this.get(name)) {
				per += this.get(name+"_koef");
			}
		}
		salary *= per/100;
		
		if (this.get("relocation")) {
			salary *= Salary.RELOCATION_KOEF;
			salary = Math.max(salary, Salary.RELOCATION_MONTH_MIN);
		}
		
		let rate = Math.max(salary / hours, Salary.HOUR_RATE_MIN);
		
		salary = rate * hours;
		
		salary = SGModel.roundTo(salary, -3);
		this.set("salary_hour", SGModel.roundTo(rate, -1));
		this.set("salary_month", salary);
		this.set("salary_year", this.get("salary_month") * (this.get("contract") === Salary.CONTRACT_LABOR ? 12 : 11));
		
		this.set('salary_hour_usd', SGModel.roundTo(1.5*this.properties.salary_hour / this.properties.usdrub, 0));
		this.set('salary_month_usd', SGModel.roundTo(1.5*this.properties.salary_month / this.properties.usdrub, -2));
		
		if (this.get("contract") === Salary.CONTRACT_LABOR) {
		
			let sml_fot = salary + salary * this.constructor.NDFL;
			let sml = sml_fot + sml_fot * this.constructor.INSURANCE;

			this.set("salary_labor_fot", sml_fot);
			this.set("salary_labor_ndfl", sml_fot * this.constructor.NDFL);
			this.set("salary_labor_insurance", sml_fot * this.constructor.INSURANCE);
			this.set("salary_labor_month", sml);
			this.set("salary_labor_year", sml * 12);
			
			let salary_self = this.get("salary_month") / Salary.CONTRACT_KOEF[Salary.CONTRACT_LABOR - 1];
			this.set("self_benefit_percent", ((this.get("salary_labor_year") - salary_self * 11) / this.get("salary_labor_year") * 100).toFixed(1));
		}
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
		return (''+value.toLocaleString().replace(/,.*/, "")).replace(/\s/g, "&thinsp;");
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
	
	setContractSelf() {
		this.set("contract", Salary.CONTRACT_SELF);
	}
	
	static currencyURL = 'https://www.cbr-xml-daily.ru/daily_json.js';
	
	checkDollarInRubles() {
		
		var xhr = new XMLHttpRequest();
		xhr.onload = (evt)=>{
			//debugger;
			this.set('usdrub', SGModel.roundTo(xhr.response.Valute.USD.Value, 2));
		};
		xhr.onerror = (err)=>{
			// no code
		};
		
		xhr.open('GET', Salary.currencyURL);
		xhr.responseType = 'json';
		xhr.send();
	}
}

addEventListener("load", ()=>{ window.salaryApp = new Salary(); });