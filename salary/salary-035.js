"use strict";

class OptionsMethods {
  constructor(values) {
    Object.assign(this, values);
  }
  getSymbolByIndex(code) { return Object.keys(this)[code]; };
  getValueByIndex(code) { return this[this.getSymbolByIndex(code)][0]; };
  getDescByIndex(code) { return this[this.getSymbolByIndex(code)][1]; };
  symb(name) {
    for (let p in this) {
      if (p.length === 1 && typeof this[p] === 'object') {
        if (this[p][1] === name) {
          return p;
        }
      }
    }
    return void 0;
  };
};

class Salary extends SGModelView {
	
	static singleInstance = true;
	
	static CURRENT_VERSION = 2;
	
	static defaultProperties = {
		initialized: false,
		
		version: 3,
		
		contract: 's',
		level: 'm',
		days_in_week: 5,
		england: 'a',
		hours_in_day: 4,
		relocation: false,
		deadline: false,
		otech: false,
		code: '1',
		es_node: false,
		vue3: false,
		react: false,
		java: false,
		//sapui5: false,
		php: false,
		cpp: false,
		typescript: false,
		//pixijs: false,
		//matterjs: false,
		sg2d: false,
		
		// скидки/наценки в %
		es_node_koef: -10,
		vue3_koef: 5,
		react_koef: 25,
		java_koef: 50,
		//sapui5_koef: 5,
		php_koef: 30,
		cpp_koef: 30,
		typescript_koef: 25,
		//pixijs_koef: -5,
		//matterjs_koef: -5,
		sg2d_koef: -25,
		
		rate_hour_min: 0,
		relocation_month_min: 0,
		relocation_rate_min: 0,
		salary_month: 0,
		hours: 0,
		hours_meas: "",
		hours_in_day_desc: "",
		timeout: 5,
		rate: 0,
		salary_year: 0,
		
		usdrub: 0,
		salary_month_usd: 0,
		rate_usd: 0,
		
		salary_labor_fot: 0,
		salary_labor_ndfl: 0,
		salary_labor_insurance: 0,
		salary_labor_month: 0,
		salary_labor_year: 0,
		contract_self_limit: 0,
		self_benefit_percent: 0.0,
		
		//options_expand: true,
		//options_expand_icon: ""
	};
	
	static typeProperties = {
		version: SGModel.TYPE_NUMBER,
		
		contract: SGModel.TYPE_STRING,
		level: SGModel.TYPE_STRING,
		days_in_week: SGModel.TYPE_NUMBER,
		england: SGModel.TYPE_STRING,
		hours_in_day: SGModel.TYPE_NUMBER,
		relocation: SGModel.TYPE_BOOLEAN,
		deadline: SGModel.TYPE_BOOLEAN,
    otech: SGModel.TYPE_BOOLEAN,
		code: SGModel.TYPE_STRING,
		es_node: SGModel.TYPE_BOOLEAN,
		vue3: SGModel.TYPE_BOOLEAN,
		react: SGModel.TYPE_BOOLEAN,
		java: SGModel.TYPE_BOOLEAN,
		//sapui5: SGModel.TYPE_BOOLEAN,
		php: SGModel.TYPE_BOOLEAN,
		cpp: SGModel.TYPE_BOOLEAN,
		typescript: SGModel.TYPE_BOOLEAN,
		//pixijs: SGModel.TYPE_BOOLEAN,
		//matterjs: SGModel.TYPE_BOOLEAN,
		sg2d: SGModel.TYPE_BOOLEAN,
		
    otech_per: SGModel.TYPE_NUMBER,
    
		salary_labor_fot: SGModel.TYPE_NUMBER,
		salary_labor_ndfl: SGModel.TYPE_NUMBER,
		salary_labor_insurance: SGModel.TYPE_NUMBER,
		salary_labor_month: SGModel.TYPE_NUMBER,
		salary_labor_year: SGModel.TYPE_NUMBER,
		contract_self_limit: SGModel.TYPE_NUMBER,
		self_benefit_percent: SGModel.TYPE_NUMBER,
		
		//options_expand: SGModel.TYPE_BOOLEAN,
		//options_expand_icon: SGModel.TYPE_STRING
	};
	
	static hashProperties = {
		v: "version",
		
		C: "contract",
		L: "level",
		D: "days_in_week",
		E: "england",
		H: "hours_in_day",
		Q: "relocation",
		W: "deadline",
    Z: "otech",
		G: "code",
		J: "es_node",
		V: "vue3",
		R: "react",
		A: "java",
		//U: "sapui5",
		P: "php",
		O: "cpp",
		T: "typescript",
		//I: "pixijs",
		//M: "matterjs",
		S: "sg2d",
	};
	
	static HOUR_RATE_BASE = 2000;
	static HOUR_RATE_MIN = 1500;
	static RELOCATION_MONTH_MIN = 600000;
	static RELOCATION_RATE_MIN = 600000/80;
	static CONTRACT_SELF_LIMIT = 5000000;
	
	static CONTRACTS = new OptionsMethods({
		"s": [0, 'self'],
		"l": [-5, 'labor'],
		"f": [+40, 'freelance'],
		"i": [+50, 'ip'],
	});
	
	static NDFL = 0.13;
	static INSURANCE = 0.22 + 0.051+0.029 + 0.002;
	
	static LEVELS = new OptionsMethods({
		"t": [-25, 'trainee'],
		"j": [-10, 'junior'],
		"m": [0, 'middle'],
		"s": [+10, 'senior'],
		"l": [+25, 'teamlead']
	});
  
	static ENGLANDS = new OptionsMethods({
		"a": [0, 'a'],
		"b": [100, 'b']
	});
	
	static DAYS_IN_WEEK_KOEF = [void 0, -50, -40, -30, -20, 0, +100, +200];
	
	static RELOCATION_KOEF = 2;
  
	static OTECH_KOEF = 0.8;
	
	static USDKOEF = 1.25;
	
	static HOURS_KOEF = [void 0, -15, -10, -5, 0, +10, +20, +30, +40];
	static CODES = [
		[-25, 'Проект с нуля или кода очень мало'],
		[0, 'Код поддерживается полностью текущим штатом'],
		[+25, 'Около 25% legacy в проекте'],
		[+50, 'Около 50% legacy в проекте'],
		[+75, 'Около 75% legacy в проекте'],
		[+100, 'Проект никто не поддерживает!'],
	];
  
	static TIMEOUTS = [void 0, 5, 5, 5, 5, 10, 10, 15, 15];
	
	initialize() {
		
		this.checkDollarInRubles();
		
		Salary.CONTRACTS._inverse = {};
		for (let p in Salary.CONTRACTS) {
			if (p[0] !== '_') {
				Salary.CONTRACTS._inverse[Salary.CONTRACTS[p][1]] = p;
			}
			this.set('contract_' + Salary.CONTRACTS[p][1], Salary.CONTRACTS[p][0]);
		}
		
		for (let p in Salary.LEVELS) {
			this.set('level_' + Salary.LEVELS[p][1], Salary.LEVELS[p][0]);
		}
    
		for (let p in Salary.ENGLANDS) {
			this.set('eng_' + Salary.ENGLANDS[p][1], Salary.ENGLANDS[p][0]);
		}
		
		for (let i = 1; i < Salary.DAYS_IN_WEEK_KOEF.length; i++) {
			this.set('days_in_week_' + i, Salary.DAYS_IN_WEEK_KOEF[i]);
		}
		
		this.set("contract_self_limit", Salary.CONTRACT_SELF_LIMIT);
    
		this.set('otech_per', 100*(Salary.OTECH_KOEF - 1), { precision: 1 });
		
		/*let codeTypes = ["code_startup", "code_supported", "code_supported_and_legacy", "code_legacy"];
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
		});*/
		
		this.on("hours_in_day", (hours)=>{
			this.set("hours_in_day_desc", (hours == 8 ? "Фуллтайм" : hours + " " + this.getHoursMeas(hours)+"/день")); // TODO: надписи вытащить в шаблон?
			this.set("timeout", Salary.TIMEOUTS[hours]);
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.on('code', (code)=>{
			this.set('code_desc', Salary.CODES[code][1]);
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.on("hours", (hours)=>{
			this.set("hours_meas", this.getHoursMeas(hours));
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		/*this.on("options_expand", (options_expand)=>{
			this.set("options_expand_icon", options_expand ? "&nbsp;&#9660;" : "...");
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);*/
		
		this.set("rate_hour_min", Salary.HOUR_RATE_MIN);
		this.set("relocation_month_min", Salary.RELOCATION_MONTH_MIN);
		this.set("relocation_rate_min", Salary.RELOCATION_RATE_MIN);
		
		let eRelocationLabel = document.querySelector("#relocation_label");
		eRelocationLabel.title = eRelocationLabel.title.replace("%relocation_month_min%", Salary.RELOCATION_MONTH_MIN);
		
		this.bindHTML("body");
		
		// Hash parser
		let parameters = Array.from(location.hash.matchAll(/(\w)(\w)/g));
		if (parameters.length) {
			let _parameters = {};
			for (let p in parameters) {
				var code = parameters[p][1];
				var value = parameters[p][2];
				var name = Salary.hashProperties[code];
				if (name) {
					_parameters[name] = value;
				}
			}
			if ((_parameters.version || 1) >= Salary.CURRENT_VERSION) {
				for (let p in _parameters) {
					this.set(p, _parameters[p]);
				}
			} else {
				alert('Ссылка не поддерживается - версия хеша ' + location.hash + ' устарела!');
			}
		}
		
		this.on(Object.values(Salary.hashProperties), this.calc);
		this.on('usdrub', this.calc, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.set("initialized", true);
	}
	
	static _fields_koef = [
		"es_node",
		"react",
		"java",
		"vue3",
		"php",
		"cpp",
		"typescript",
		"sg2d"
	];
	
	calc() {
		let hours = 4 * this.get("days_in_week") * this.get("hours_in_day");
		this.set("hours", hours);
		let koef = 1;
		
		koef *= k(Salary.CONTRACTS[this.get("contract")][0]);
		koef *= k(Salary.LEVELS[this.get("level")][0]);
		koef *= k(Salary.CODES[this.get("code")][0]);
		koef *= k(Salary.ENGLANDS[this.get("england")][0]);
		
		if (this.get('deadline')) {
			koef *= k(Salary.DAYS_IN_WEEK_KOEF[ Math.max(5, this.get("days_in_week")) ]);
			koef *= k(Salary.HOURS_KOEF[8]);
		} else {
			koef *= k(Salary.DAYS_IN_WEEK_KOEF[this.get("days_in_week")]);
			koef *= k(Salary.HOURS_KOEF[this.get("hours_in_day")]);
		}
    
    if (this.get('otech')) {
      koef *= Salary.OTECH_KOEF;
    }
		
		for (var i = 0; i < Salary._fields_koef.length; i++) {
			var name = Salary._fields_koef[i];
			if (this.get(name)) {
				koef *= k(this.get(name+"_koef"));
			}
		}
		
		let rate = SGModel.roundTo(Math.max(Salary.HOUR_RATE_BASE * koef, Salary.HOUR_RATE_MIN) / 5, -1) * 5;
		let salary = SGModel.roundTo(rate * hours, -3);
		
		if (this.get('relocation')) {
			if (rate < Salary.RELOCATION_RATE_MIN) {
				rate = Salary.RELOCATION_RATE_MIN;
				salary = SGModel.roundTo(rate * hours, -3);
			}
			if (salary < Salary.RELOCATION_MONTH_MIN) {
				salary = Salary.RELOCATION_MONTH_MIN;
				rate = salary / hours;
			}
		}
		
		this.set("rate", rate);
		this.set("salary_month", salary);
		this.set("salary_year", this.get("salary_month") * (this.get("contract") === Salary.CONTRACTS.symb('labor') ? 12 : 11));
		this.set('rate_usd', SGModel.roundTo(Salary.USDKOEF * this.get('rate') / this.get('usdrub'), 0));
		this.set('salary_month_usd', SGModel.roundTo(1.1 * this.get('salary_month') / this.get('usdrub'), -2));
		
		if (this.get("contract") === Salary.CONTRACTS.symb('labor')) {
			const sml_fot = salary + salary * Salary.NDFL;
			const sml = sml_fot + sml_fot * Salary.INSURANCE;

			this.set("salary_labor_fot", sml_fot);
			this.set("salary_labor_ndfl", sml_fot * Salary.NDFL);
			this.set("salary_labor_insurance", sml_fot * Salary.INSURANCE);
			this.set("salary_labor_month", sml);
			this.set("salary_labor_year", sml * 12);
			
			const salary_self = this.get("salary_month") / k(Salary.CONTRACTS[Salary.CONTRACTS.symb('labor')][0]);
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
		const per = Salary.HOURS_KOEF[value];
		return this.formatDiscount(per);
	}
	
	formatCodeExtraCharge(code) {
		const per = Salary.CODES[code][0];
		return this.formatDiscount(per);
	}
	
	formatDiscount(per) {
		if (per) {
			return '(' + (per > 0 ? '+' : '') + per + '%)';
		} else {
			return '';
		}
	}
	
	getCodeTitle(code) {
		return Salary.CODES[code][1];
	}
	
	getHourTitle(hour) {
		const per = Salary.HOURS_KOEF[hour];
		if (! per) return '';
		return (per > 0 ? '+' : '') + per + '%';
	}
	
	cssDangerOrSuccess(propertyOrValue) {
		let value = (typeof propertyOrValue === "string" && propertyOrValue.length > 1 ? this.get(propertyOrValue) : propertyOrValue);
		if (value == 0) return ""; else return value < 0 ? "text-success" : "text-danger";
	}
	
	/*toggleOptions() {
		this.set("options_expand", ! this.get("options_expand"));
	}*/
	
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
			if (value === false) value = 0;
			if (value === true) value = 1;
			hash.push(code + value);
		}
		let href = location.href.replace(/#.*/, "") + "#" + hash.join("");
		let link_input = document.querySelector("#link_link");
		link_input.value = href;
	}
	
	sendEmail(event) {
		window.open("mailto:offer@sg2d.ru?subject="+event.currentTarget.dataset.subject+
			"&body="+event.currentTarget.dataset.body
				.replace("%hours_in_day%", this.get("hours_in_day"))
				.replace("%rate%", this.get("rate"))
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
		this.set("contract", Salary.CONTRACTS.symb('self'));
	}
	
	static currencyURL = 'https://www.cbr-xml-daily.ru/daily_json.js';
	
	checkDollarInRubles() {
		
		var xhr = new XMLHttpRequest();
		xhr.onload = (evt)=>{
			try {
				this.set('usdrub', SGModel.roundTo(xhr.response.Valute.USD.Value, 2));
			} catch(err) {
				// no code
			}
		};
		xhr.onerror = (err)=>{
			// no code
		};
		
		xhr.open('GET', Salary.currencyURL);
		xhr.responseType = 'json';
		xhr.send();
	}
}

function k(per) {
  return 1 + per/100;
}

addEventListener("load", ()=>{ window.salaryApp = new Salary(); });