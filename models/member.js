const { sequelize, Sequelize : { QueryTypes } } = require('./index');
const bcrypt = require("bcrypt");
const logger = require('../lib/logger');

const member = {
	join : async function(memNm, memId, memPw){
		try {
			const hash = await bcrypt.hash(memPw, 10);
			const sql = `INSERT INTO member (memNm, memId, memPw)
								VALUES (:memNm, :memId, :memPw)`;
			const replacements = {
				memNm, memId, memPw :hash,
			}
			await sequelize.query(sql,{
				replacements,
				type: QueryTypes.INSERT,
			});
			return true;
		} catch(err){
			logger(err.message, 'error');
			logger(err.stack, 'error');
			return false;
		}
	},
	login : async function(memId, memPw, req){
		try {
			const sql = `SELECT * FROM member WHERE memId = ? `;
			const rows = await sequelize.query(sql,{
				replacements : [memId],
				type : QueryTypes.SELECT,
			});
			if(rows.length == 0){
				return false;
			}
			
			const match = await bcrypt.compare(memPw, rows[0].memPw);
			
			if(match){
				req.session.memId = rows[0].memId;
				req.session.memNo = rows[0].memNo;
				return true;
			}
			
			return false;
		} catch(err) {
			logger(err.message, 'error');
			logger(err.stack, 'error');
			return false;
		}
	}
};

module.exports = member;