/**
	스케쥴 등록 유효성 검사
*/
module.exports.validator = (req,res,next) =>{
	const required = {		
		color: '색상을 선택하세요',
		title: '제목을 입력하세요',
		startDate : '시작일을 입력하세요',
		endDate : '종료일을 입력하세요',
	};
	
	try {
		for(column in required){
			if(!req.body[column]){
				throw new Error(required[column]);
			}
		}
		
		/** 시작일 종료일 비교 체크 */
		const startDate = req.body.startDate.split('.');
		const endDate = req.body.endDate.split('.');
		
		const startStamp = new Date(startDate[0], startDate[1], startDate[2]).getTime();
		const endStamp = new Date(endDate[0], endDate[1], endDate[2]).getTime();
		
		if(startStamp > endStamp){
			throw new Error('종료일이 시작일보다 빠릅니다.');
		}
		
	} catch(err) {
		/** axios 로 처리하기때문에  json 으로 return */
		const data ={
			success : false,
			message : err.message,
		};
		return res.json(data);
	}
	
	next(); //유효성 검사 성공시 다음 미들웨어 
};