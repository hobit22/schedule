const { sequelize, Sequelize : { QueryTypes } } = require("./index");
const logger = require('../lib/logger');

/**
	스케쥴러 Model
*/
const scheduler = {
	/**
	스케쥴 달력 일자 + 스케쥴
	
	@param Int|string 	year 연도
	@param Int|string 	month 월
	
	@return JSON
	*/
	getCalendar : async function(year, month) {
		let date = new Date();
		year = year || date.getFullYear();
		month = month || (date.getMonth() +1);
		month = Number(month);
		/**
		1. 현재 달의 시작일, 현재 달의 마지막일(28,29,30,31)
		2. 현재 달의 시작 요일(0-7, 일-토)
		*/
		date = new Date(year,month -1, 1); // 이번달 1일
		const timeStamp=date.getTime();
		const dayStamp = (60 * 60 * 24) * 1000;
		
		const yoil = date.getDay(); // 요일 0-6
		const startNo = yoil * - 1;
		const endNo = 42 + startNo;
		
		let nextMonthDays = 0;
		let days=[]; //날짜
		
		//42일 기준으로 만들예정
		for(let i = startNo; i<endNo; i++){		
			const newStamp = timeStamp + dayStamp * i ;
			date = new Date(newStamp);
			
			const newYear = date.getFullYear();
			let newMonth = Number(date.getMonth() + 1);
			let newDay = date.getDate();
			if(newStamp > timeStamp && month != newMonth) {// 다음달
				nextMonthDays++;
			}
			
			newMonth = (newMonth <10)?"0"+newMonth:newMonth;
			newDay = (newDay < 10)?"0"+newDay:newDay;
			
			const str = `${newYear}.${newMonth}.${newDay}`;
			const stamp = parseInt(newStamp / 1000); 			
			
			days.push({
				'date' : str, // 2020.07.20
				'day' : newDay, //01, 02 ...
				'yoil' : this.getYoil(newStamp), // 일, 월, 화 ...
				'yoilEn' : this.getYoil(newStamp, 'en'),
				'stamp' : stamp , // 1초단위 unix timestamp
				'object' : date,
			});
			
		}//endfor
		
		if(nextMonthDays >= 7){
			/*
			days.forEach((v,i, _days)=>{
				if(i >= 35) {
					delete days[i];
				}
			});
			*/
			days.length = 35;
		}
		
		/** 스케줄 조회 S */
		const schedules = this.get(days[0].object, days[days.length -1].object);
		/** 스케줄 조회 E */
		
		let nextYear = year, prevYear = year;
		let nextMonth = month, prevMonth = month;
		if(month == 1) {
			prevMonth = 12;
			prevYear--;
			nextMonth++;
		} else if( month ==12 ){
			nextMonth = 1;
			nextYear++;
			prevMonth--;
		} else {
			prevMonth--;
			nextMonth++;
		}
		
		const yoilsEn = this.getYoils('en');
		
		//console.log(days);
		return { days, year, month, yoilsEn, prevYear, prevMonth, nextYear, nextMonth };
		
	},
	/**
	현재 요일 구하기
	*/
	getYoil : function(timeStamp, mode){
		mode = mode || 'kr';
		let date;
		if(timeStamp){
			date = new Date(timeStamp);
		} else {
			date = new Date();
		}
		const yoils = this.getYoils(mode);
		const yoil = date.getDay();
		return yoils[yoil];
	},
	
	getYoils : function(mode){
		mode = mode || 'kr';
		if( mode == 'kr' ){
			return ['일','월','화','수','목','금','토'];
		} else{
			return ['SUN', 'MON', 'TUE', 'WEN', 'TUR', 'FRI', 'SAT'];
		}
	},
	
	/**
		선택 가능 색상 코드(hexcode + 영문색상명)
	*/
	getColors : function() {
		return [ 
			'pink',
			'blue',
			'skyblue',
			'orange',
			'red',			
			'gray',
		];
	},
	/**
		스케쥴 추가
		입력 양식 2020.01.02
	*/
	add : async function (params) {
		const startDate = params.startDate.split(".");
		const startStamp = new Date(startDate[0], Number(startDate[1]) -1, Number(startDate[2])).getTime();
		
		const endDate = params.endDate.split(".");
		const endStamp = new Date(endDate[0], Number(endDate[1]) -1, Number(endDate[2])).getTime();
		
		const step = 60 * 60 * 24 * 1000; 
		try{
			for(let i = startStamp ; i<= endStamp; i+=step){
				const sql = `INSERT INTO schedule (scheduleDate, title, color) 
									VALUES (:scheduleDate, :title, :color)`;
				
				const replacements = {
					scheduleDate: new Date(i),
					title : params.title,
					color: params.color,
				};
				
				await sequelize.query(sql, {
					replacements,
					type : QueryTypes.INSERT,
				});
			}
			return true;
		}catch(err){
			logger(err.message, 'error');
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
		스케쥴 조회
	*/	
	get : async function(sdate, edate){
		if(!sdate || !edate){
			return false;
		}
		
		const sql =`SELECT * FROM schedule WHERE scheduleDate BETWEEN ? AND ?`;
		const rows = await sequelize.query(sql, {
			replacements : [sdate, edate],
			type : QueryTypes.SELECT,
		});
		
		const list = {};
		
		//날짜	- 색상 -일정
		//		- 색상
		
		rows.forEach((v) => {
			//console.log(v);
			let scheduleDate = "S" + v.scheduleDate.replace(/-/g, '');
			list[scheduleDate][v.color] = list[scheduleDate][v.color] || [];
			list[scheduleDate][v.color].push(v);
		});
		console.log(list);
		
	},
};

module.exports = scheduler;