"use strict";

const CURRENT_VERSION = 10;

class OptionsMethods {
	constructor(values) {
		Object.assign(this, values);
	}
	getSymbolByIndex(code) { return Object.keys(this)[code]; };
	getValueByIndex(code) { return this[this.getSymbolByIndex(code)][0]; };
	getDescByIndex(code) { return this[this.getSymbolByIndex(code)][1]; };
	getValueBySymbol(symb) { return this[symb][1]; };
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
	
	static defaultProperties = {
		initialized: false,
		
		version: CURRENT_VERSION,
		
		contract: 'l',
		level: 'm',
		days_in_week: 5,
		england: 'a',
		hours_in_day: 4,
		with_combining: false,
		hourly_payment: false,
		schedule: 'b',
		deadline: false,
		otech: false,
		code: '1',
		ecmascript: true,
		esnext: true,
		nodejs: true,
		java: false,
		vue: false,
		react: false,
		postgresql: true,
		php: false,
		cpp: false,
		typescript: false,
		vanillajs: false,
		threejs: false,
		nestjs: false,
		golang: false,
		
		// скидки/наценки в %
		ecmascript_koef: -10,
		esnext_koef: -10,
		nodejs_koef: -10,
		java_koef: +40,
		vue_koef: +5,
		react_koef: +40,
		postgresql_koef: -5,
		php_koef: +25,
		cpp_koef: +10,
		typescript_koef: +15,
		vanillajs_koef: -5,
		nestjs_koef: -10,
		threejs_koef: -10,
		golang_koef: +15,
		
		promocode: '',
		promocode_status: false,
		promocode_success: false,
		promocode_error: false,
		promocode_per: 0,
		
		rate_hour_min: 0,
		salary_month_without_promocode: 0,
		salary_month: 0,
		hours: 0,
		hours_meas: "",
		hours_in_day_desc: "",
		timeout: 5,
		rate: 0,
		salary_year: 0,
		
		usdrub: 0,
		cnyrub: 0,
		tonrub: 0,
		salary_month_usd: 0,
		rate_usd: 0,
		salary_month_cny: 0,
		rate_cny: 0,
		salary_month_ton: 0,
		rate_ton: 0,
		
		contract_self_limit: 0,
		current_year: new Date().getFullYear()
	};
	
	static typeProperties = {
		version: SGModel.TYPE_NUMBER,
		
		contract: SGModel.TYPE_STRING,
		level: SGModel.TYPE_STRING,
		days_in_week: SGModel.TYPE_NUMBER,
		england: SGModel.TYPE_STRING,
		hours_in_day: SGModel.TYPE_NUMBER,
		with_combining: SGModel.TYPE_NUMBER,
		hourly_payment: SGModel.TYPE_BOOLEAN,
		deadline: SGModel.TYPE_BOOLEAN,
		otech: SGModel.TYPE_BOOLEAN,
		code: SGModel.TYPE_STRING,
		ecmascript: SGModel.TYPE_BOOLEAN,
		esnext: SGModel.TYPE_BOOLEAN,
		nodejs: SGModel.TYPE_BOOLEAN,
		java: SGModel.TYPE_BOOLEAN,
		vue: SGModel.TYPE_BOOLEAN,
		react: SGModel.TYPE_BOOLEAN,
		postgresql: SGModel.TYPE_BOOLEAN,
		php: SGModel.TYPE_BOOLEAN,
		cpp: SGModel.TYPE_BOOLEAN,
		typescript: SGModel.TYPE_BOOLEAN,
		vanillajs: SGModel.TYPE_BOOLEAN,
		threejs: SGModel.TYPE_BOOLEAN,
		nestjs: SGModel.TYPE_BOOLEAN,
		golang: SGModel.TYPE_BOOLEAN,
		
		otech_per: SGModel.TYPE_NUMBER,
		
		promocode: SGModel.TYPE_STRING,
		promocode_status: SGModel.TYPE_BOOLEAN,
		promocode_success: SGModel.TYPE_BOOLEAN,
		promocode_error: SGModel.TYPE_BOOLEAN,
		promocode_per: SGModel.TYPE_NUMBER,
    
		contract_self_limit: SGModel.TYPE_NUMBER,
	};
	
	static hashProperties = {
		v: "version",
		A: "vanillajs",
		B: "hourly_payment",
		C: "contract",
		D: "days_in_week",
		E: "england",
		F: "postgresql",
		G: "code",
		H: "hours_in_day",
		J: "ecmascript",
		K: "threejs",
		M: "nestjs",
		N: "nodejs",
		O: "golang",
		P: "php",
		//Q: "",
		R: "react",
		S: "cpp",
		T: "typescript",
		U: "with_combining",
		W: "deadline",
		V: "vue",
		X: "schedule",
		Y: "java",
		Z: "otech",
		I: "esnext", // после nestjs, react и vue
		L: "level", // level идёт последним!
	};
	
	static HOUR_RATE_BASE = 3850;
	static HOUR_RATE_MIN = 1000;
	static CONTRACT_SELF_LIMIT = 2400000;
	
	static CONTRACTS = new OptionsMethods({
		"l": [-15, 'labor'],
		"g": [-10, 'gph'],
		"s": [0, 'self'],
		"i": [+15, 'ip'],
		"c": [+50, 'crypta'],
		"f": [+100, 'freelance'],
	});
	
	static LEVEL_DEFAULT = 'j';
	
	static SCHEDULES = new OptionsMethods({
		"a": [0, 'office'],
		"b": [-25, 'remote'],
		"c": [+25, 'relocation'],
		"d": [+200, 'relocation_out'],
	});
	
	static LEVELS = new OptionsMethods({
		"t": [-50, 'trainee'],
		"j": [-30, 'junior'],
		"i": [-20, 'junior_plus'],
		"u": [-10, 'middle_minus'],
		"m": [0, 'middle'],
		"n": [+20, 'middle_plus'],
		"s": [+50, 'senior'],
		"l": [+100, 'teamlead']
	});
  
	static ENGLANDS = new OptionsMethods({
		"a": [0, 'a'],
		"b": [25, 'b'],
		"c": [100, 'c']
	});
	
	static DAYS_IN_WEEK_KOEF = [void 0, +10, -10, -15, -10, 0, +100, +200];

	static OTECH_KOEF = 11.00;
	static WITH_COMBINING = -20; // %
	static HOURLY_PAYMENT_PER = +30; // %
	static HOURS_DEADLINE_KOEF = +30; // %
	static DEADLINE_AND_HOURLY_PAYMENT_PER = +40; // %
	
	static USDKOEF = 1.25;
	
	static HOURS_KOEF = [void 0, +25, -10, -5, 0, +5, +10, +15, +20];
	
	static CODES = [
		[-10, 'Проект с нуля или кода очень мало'],
		[0, 'Код поддерживается полностью текущим штатом'],
		[+10, 'Около 25% legacy в проекте'],
		[+20, 'Около 50% legacy в проекте'],
		[+33, 'Около 75% legacy в проекте'],
		[+50, 'Проект никто не поддерживает!'],
	];
	
	static TIMEOUTS = [void 0, 0, 0, 5, 5, 10, 10, 15, 15];
	
	static _fields_koef = {
		'ecmascript': 'n',
		'esnext': 'u',
		'nodejs': 'm',
		'react': 't',
		'postgresql': 'u',
		'vue': 't',
		'php': 'u',
		'cpp': 'i',
		'typescript': 'i',
		'vanillajs': 'u',
		'java': 'j',
		'threejs': 'j',
		'nestjs': 't',
		'golang': 't',
	};
	
	static PROMOCODES = { // %
		AZURE3: -3,
		YELLOW5: -5,
		CYAN8: -8,
		ORANGE10: -10,
		GRAY12: -12,
		MAROON15: -15,
		TEAL18: -18,
		PURPLE20: -20,
		AQUA22: -22,
		MAGENTA25: -25,
		RED30: -30,
		BROWN33: -33,
		SIENNA35: -35,
		GREEN40: -40,
		ROYALBLUE45: -45,
		NAVY50: -50,
		SILVER60: -60,
		GOLD75: -75,
		INDIGO80: -80,
		BLACK90: -90,
	};
	
	async initialize() {
		
		try {
			this.checkUSDCNYInRubles();
			this.checkTONCoinInRubles();
		} catch (err) {}
		
		Salary.CONTRACTS._inverse = {};
		for (let p in Salary.CONTRACTS) {
			if (p[0] !== '_') {
				Salary.CONTRACTS._inverse[Salary.CONTRACTS[p][1]] = p;
			}
			this.set('contract_' + Salary.CONTRACTS[p][1], Salary.CONTRACTS[p][0]);
		}
		
		Salary.SCHEDULES._inverse = {};
		for (let p in Salary.SCHEDULES) {
			if (p[0] !== '_') {
				Salary.SCHEDULES._inverse[Salary.SCHEDULES[p][1]] = p;
			}
			this.set('schedule_' + Salary.SCHEDULES[p][1], Salary.SCHEDULES[p][0]);
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
		
		this.set('contract_self_limit', Salary.CONTRACT_SELF_LIMIT);
		
		this.set('otech_per', 100*(Salary.OTECH_KOEF - 1), { precision: 1 });
		
		this.on('hours_in_day', (hours) => {
			if (hours > 4) {
				this.set('with_combining', false);
				document.querySelector('#with_combining').disabled = true;
			} else {
				document.querySelector('#with_combining').disabled = false;
			}
			this.set('hours_in_day_desc', (hours === 8 ? 'Фуллтайм' : hours + ' ' + this.getHoursMeas(hours) + '/день')); // TODO: надписи вытащить в шаблон?
			this.set('timeout', Salary.TIMEOUTS[hours]);
			// TODO: переделать, когда sgAttribute будет динамическим!
			//document.querySelector('input#deadline').disabled = (hours == 8);
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.on('code', (code)=>{
			this.set('code_desc', Salary.CODES[code][1]);
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.on('hours', (hours)=>{
			this.set('hours_meas', this.getHoursMeas(hours));
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.on('deadline', () => {
			['days_in_week_1', 'days_in_week_2', 'days_in_week_3', 'days_in_week_4'].forEach((name) => {
				this.set(name, this.get(name), void 0, SGModel.FLAG_FORCE_CALLBACKS);
			});
			this.set('days_in_week', this.get('days_in_week'), void 0, SGModel.FLAG_FORCE_CALLBACKS);
		});
		
		const ecmaTechDependent = ['vanillajs', 'typescript', 'react', 'vue', 'nestjs', 'esnext', 'nodejs', 'threejs'];
		ecmaTechDependent.forEach(code => {
			this.on(code, (value) => {
				if (value) {
					this.set('ecmascript', true);
				}
			});
		});
		this.on('ecmascript', (ecmascript) => {
			if (!ecmascript) {
				ecmaTechDependent.forEach(code => {
					this.set(code, false);
				});
			}
		});
		this.on('esnext', (esnext) => {
			if (esnext) {
				this.set('typescript', false);
			}
		});
		this.on('typescript', (typescript) => {
			if (typescript) {
				this.set('esnext', false);
			}
		});
		this.on('nestjs', (nestjs) => {
			if (nestjs) {
				this.set('ecmascript', true);
				this.set('typescript', true);
				this.set('nodejs', true);
			}
		});
		this.on('nodejs', (nodejs) => {
			if (nodejs) {
				this.set('ecmascript', true);
			}
		});
		this.on('react', (react) => {
			if (react) {
				this.set('typescript', true);
			}
		});
		['react', 'vue'].forEach(code => {
			this.on(code, (value) => {
				if (value) {
					this.set('vanillajs', false);
				}
			});
		});
		['vanillajs'].forEach(code => {
			this.on(code, (value) => {
				if (value) {
					this.set('react', false);
					this.set('vue', false);
				}
			});
		});
		this.on('threejs', (threejs) => {
			if (threejs) {
				this.set('ecmascript', true);
			}
		});
		
		const ePromocode = document.querySelector('#promocode');
		ePromocode.addEventListener('keydown', () => {
			this.set('promocode_status', false);
			this.set('promocode_success', false);
			this.set('promocode_error', false);
			if (ePromocode.value) {
				ePromocode;
			}
		});
		
		const checkPromocode = () => {
			const promocode = this.get('promocode');
			setTimeout(() => {
				const bExists = !!Salary.PROMOCODES[promocode];
				this.set('promocode_per', (bExists ? Salary.PROMOCODES[promocode] : 0));
				this.set('promocode_success', bExists);
				this.set('promocode_error', !bExists);
			}, 500);
		};
		
		this.on('promocode_status', (status) => {
			if (status) {
				checkPromocode();
			} else {
				this.set('promocode_status', false);
				this.set('promocode_success', false);
				this.set('promocode_error', false);
			}
		});
		
		// Автоматический level
		this.on(Object.keys(Salary._fields_koef), (value, previousValue, propName) => {
			let level_cumm = 0, q = 0;
			for (let tn in Salary._fields_koef) {
				const tl = Salary._fields_koef[tn];
				if (this.get(tn)) {
					q++;
					level_cumm += Salary.LEVELS[tl][0];
				}
			}
			level_cumm /= q;
			let level = Salary.LEVEL_DEFAULT;
			let ln_prev = 't';
			let l_prev = Salary.LEVELS[ln_prev][0];
			for (const ln_cur in Salary.LEVELS) {
				if (ln_cur === 't') continue;
				const l_cur = Salary.LEVELS[ln_cur][0];
				if (level_cumm >= l_prev && level_cumm < l_cur) {
					level = ln_prev;
					break;
				}
				ln_prev = ln_cur;
			}
			this.set('level', level);
		}, void 0, void 0, SGModel.FLAG_IMMEDIATELY);
		
		this.set('rate_hour_min', Salary.HOUR_RATE_MIN);
		
		this.bindHTML("body");
		
		// Hash parser
		const result = Array.from(location.hash.matchAll(/#(v([\d]+)([^&]*))(&promocode=(.*)){0,1}/g));
		const parts = result[0];
		const version = parts && +parts[2] || null;
		if (version) {
			if (version < CURRENT_VERSION) {
				alert('Ссылка не поддерживается - версия хеша ' + location.hash + ' устарела!');
			} else {
				if (parts[3]) {
					let parameters = Array.from(parts[3].matchAll(/(\w)(\w)/g));
					for (let p in parameters) {
						var code = parameters[p][1];
						var value = parameters[p][2];
						var name = Salary.hashProperties[code];
						if (name) {
							this.set(name, value);
						}
					}
				}
				if (parts[5]) {
					this.set('promocode', parts[5]);
				}
			}
		}
		
		if (this.get('promocode') && !this.get('promocode_error')) {
			this.set('promocode_status', true);
		}
		
		this.on(Object.values(Salary.hashProperties).concat('promocode_status'), this.calc);
		
		// to update the DOM on first launch:
		this.on(['usdrub', 'cnyrub', 'tonrub'], this.calc);
		['contract', 'level', 'schedule', 'days_in_work', 'england'].forEach((name) => {
			this.set(name, this.get(name), void 0, SGModel.FLAG_FORCE_CALLBACKS);
		});
		
		this.set("initialized", true);
	}
	
	calc() {
		let hours = 4 * this.get('days_in_week') * this.get('hours_in_day');
		this.set('hours', hours);
		let koef = 1;
		
		koef *= k(Salary.CONTRACTS[this.get("contract")][0]);
		koef *= k(Salary.SCHEDULES[this.get('schedule')][0]);
		koef *= k(Salary.LEVELS[this.get("level")][0]);
		koef *= k(Salary.CODES[this.get("code")][0]);
		koef *= k(Salary.ENGLANDS[this.get("england")][0]);
		
		if (this.get('with_combining')) {
			koef *= k(Salary.WITH_COMBINING);
		}
		
		if (this.get('hourly_payment') && this.get('deadline')) {
			koef *= k(Salary.DEADLINE_AND_HOURLY_PAYMENT_PER);
			if (this.get('days_in_week') > 5) {
				koef *= k(Salary.DAYS_IN_WEEK_KOEF[this.get('days_in_week')]);
			}
		} else {
			if (this.get('hourly_payment')) {
				koef *= k(Salary.HOURLY_PAYMENT_PER);
			}
			if (this.get('deadline')) {
				koef *= k(Salary.HOURS_DEADLINE_KOEF);
				if (this.get('days_in_week') > 5) {
					koef *= k(Salary.DAYS_IN_WEEK_KOEF[this.get('days_in_week')]);
				}
			}
			if (!this.get('deadline')) {
				if (!this.get('hourly_payment')) {
					koef *= k(Salary.HOURS_KOEF[this.get('hours_in_day')]);
				}
				koef *= k(Salary.DAYS_IN_WEEK_KOEF[this.get('days_in_week')]);
			}
		}
		
		if (this.get('otech')) {
			koef *= Salary.OTECH_KOEF;
		}
		
		let perSum = 0;
		for (let t in Salary._fields_koef) {
			if (this.get(t)) {
				perSum += this.get(t + '_koef');
				//koef *= k(this.get(t + '_koef'));
			}
		}
		koef *= k(perSum);
		
		let promocodePer;
		if (this.get('promocode_status')) {
			promocodePer = Salary.PROMOCODES[this.get('promocode')] || 0;
			koef *= k(promocodePer);
		}
		
		let rate = Math.max(Salary.HOUR_RATE_BASE * koef, Salary.HOUR_RATE_MIN);
		document.querySelector('#rate_title').title = (Math.round(rate*100)/100).toFixed(2);
		rate = SGModel.roundTo(rate / 5, -1) * 5;
		let salary = SGModel.roundTo(rate * hours, -3);
		
		this.set('rate', rate);
		this.set('salary_month', salary);
		this.set('salary_month_without_promocode', salary / (1 + promocodePer/100));
		this.set('salary_year', this.get('salary_month') * (this.get('contract') === Salary.CONTRACTS.symb('labor') ? 12 : 11));
		this.set('rate_usd', SGModel.roundTo(Salary.USDKOEF * this.get('rate') / this.get('usdrub'), 1));
		this.set('salary_month_usd', SGModel.roundTo(Salary.USDKOEF * this.get('salary_month') / this.get('usdrub'), -1));
		this.set('rate_cny', SGModel.roundTo(this.get('rate') / this.get('cnyrub'), 1));
		this.set('salary_month_cny', SGModel.roundTo(this.get('salary_month') / this.get('cnyrub'), -1));
		this.set('rate_ton', SGModel.roundTo(this.get('rate') / this.get('tonrub'), 2));
		this.set('salary_month_ton', SGModel.roundTo(this.get('rate_ton') * hours, -1));
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
	
	getNumThinsp2(value) {
		const fractional = Math.floor(100*(value - Math.floor(value)));
		return (''+value.toLocaleString().replace(/,.*/, "")).replace(/\s/g, "&thinsp;") + '.' + fractional;
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
			return '' + (per > 0 ? '+' : '') + per + '%';
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
	
	cssDangerOrSuccessAndDiscountForDaysInWeek(propertyOrValue) {
		let cssClass = this.cssDangerOrSuccess(propertyOrValue);
		if (this.get('deadline')) {
			cssClass += ' no-visible';
		}
		return cssClass;
	}
	
	cssDangerOrSuccess(propertyOrValue) {
		let value = (typeof propertyOrValue === "string" && propertyOrValue.length > 1 ? this.get(propertyOrValue) : propertyOrValue);
		if (value == 0) return ""; else return value < 0 ? "text-success" : "text-danger";
	}
	
	hoursInDayClick(evt) {
		this.set('hours_in_day', evt.target.dataset.hours);
	}
	
	supportCodeClick(evt) {
		this.set('code', evt.target.dataset.code);
	}
	
	getLevelFor(tech) {
		const level = String(Salary.LEVELS.getValueBySymbol(Salary._fields_koef[tech])).replace('_plus', '+').replace('_minus', '-');
		return `${tech} - ${level}`;
	}
	
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
		if (this.get('promocode') && this.get('promocode_status')) {
			href = href + '&promocode=' + this.get('promocode');
		}
		let link_input = document.querySelector("#link_link");
		link_input.value = href;
	}
	
	sendEmail(event) {
		window.open("mailto:offer.sg2d@yandex.ru?subject="+event.currentTarget.dataset.subject+
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
	
	static currencyURLUsdCny = 'https://www.cbr-xml-daily.ru/latest.js';
	static currencyURLToncoin = 'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=rub';
	
	checkUSDCNYInRubles() {
		return this.getCourceInRubles(Salary.currencyURLUsdCny, ['usdrub', 'cnyrub'], ['rates.USD', 'rates.CNY'], [-1, -1]);
	}
	
	checkTONCoinInRubles() {
		return this.getCourceInRubles(Salary.currencyURLToncoin, ['tonrub'], ['the-open-network.rub'], [1]);
	}
	
	/**
	 * Получить значение курса валюты
	 * @param {string} currencyURL
	 * @param {array of string} currenciesCode
	 * @param {array of string} pathProps
	 * @param {array of number} forwardOrReverse
	 * @param {number} [precision=2]
	 * @returns {Promise}
	 */
	getCourceInRubles(currencyURL, currenciesCode = [], pathProps = [], forwardOrReverse = [], precision = 2) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			//xhr.timeout = 2000; // ms
			xhr.onload = (evt)=>{
				try {
					for (let i = 0; i < currenciesCode.length; i++) {
						const props = pathProps[i].split('.');
						let value = xhr.response;
						if (value) {
							for (let i = 0; i < props.length; i++) {
								value = value[props[i]];
								if (!value) break;
							}
							if (forwardOrReverse[i] === -1) {
								value = 1 / value;
							}
							this.set(currenciesCode[i], SGModel.roundTo(value, precision));
						} else {
							reject(new Error('For url ' + currencyURL + ' a bad response has been received! xhr.response=' + String(value) + '!'));
						}
					}
					resolve();
				} catch(err) {
					reject(err);
				}
			};
			xhr.onerror = (err)=>{
				reject(err);
			};
			xhr.ontimeout = (err)=>{
				// no code
			};
			xhr.open('GET', currencyURL.replace('$DATE$', new Date().toISOString().substring(0, 10)));
			xhr.responseType = 'json';
			xhr.send();
		});
	}
}

function k(per) {
	return 1 + per/100;
}

addEventListener("load", () => {
	window.salaryApp = new Salary();
});