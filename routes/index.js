const scheduler = require('../models/scheduler');
const express = require('express');
const { validator } = require("../middlewares/validator");
const logger = require('../lib/logger');

const router= express.Router();
// axios?

router.get('/', async (req, res, next) =>{
	const data = await scheduler.getCalendar(req.query.year, req.query.month);
	//console.log(data);
		
	res.render("main", data);
});

router.route('/schedule')
	/** 스케쥴 등록 양식 */
	.get((req,res,next)=>{
		const stamp = req.query.stamp;
		if( !stamp ){
			return res.send("<script>alert('잘못된 접근입니다.');hb.layer.close();</script>");
		}
		
		const data = {
			stamp,
			colors : scheduler.getColors(),
		};
		res.render("form", data);
	})	
	/** 스케쥴 등록 */
	.post(validator, async (req,res,next)=>{
		/*
		console.log(req.body);
		res.send("1234");
		*/
		const result = await scheduler.add(req.body);
		
		return res.json({success : result})
	})
	/** 스케쥴 수정 */
	.patch((req,res,next)=>{
		
	})
	/** 스케쥴 삭제 */
	.delete((req,res,next)=>{
		
	});
	
module.exports = router;