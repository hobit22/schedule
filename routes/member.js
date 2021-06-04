const express = require('express');
const member = require('../models/member');
const { joinValidator } = require("../middlewares/join_validator");
const { alert, go } = require("../lib/common");

const router = express.Router();

/** 회원가입 S */
router.route("/join")
		/** 회원 가입 양식 */
		.get((req,res,next) =>{
			res.render("member/join");
		})
		/** 회원 가입 처리 */
		.post( joinValidator, async (req,res,next) =>{
			try{
				const result = await member.join(req.body.memNm, req.body.memId, req.body.memPw);
				
				if(result){ // 성공
					return go("/member/login", res, "parent");
				}				
			}catch(err){
				console.error(err);
				next(err);
			}
			
			// 실패
			
			return alert("회원 등록 실패", res);
			
		});
/** 회원가입 E */

/** 로그인 S */
router.route("/login")
		//로그인 양식
		.get((req,res,next) =>{			
			return res.render("member/login");
		})
		//로그인 처리
		.post( joinValidator, async (req,res,next) =>{
			try{
				const result = await member.login(req.body.memId, req.body.memPw, req);
				
				if(result){
					return go("/", res, "parent");
				}
				
			}catch(err){
				console.error(err);
				next(err);
			}
		})
/** 로그인 E */

/** 로그아웃 S */
router.get("/logout", (req,res,next) =>{
			req.session.destroy();
			res.redirect("/");
		})


/** 로그아웃 E */

module.exports = router;