/**
* 공통 함수 
*
*/ 
const commonLib = {
	/**
	* alert 메세지 출력 
	*
	* @param String msg 출력 메세지
	* @param Object res - Response 객체
	*/
	alert : function(msg, res, url, target) {
		let addScript = "";
		if(url){
			target = target || 'self';
			addScript = `${target}.location.href='${url}';`;
		}
		return res.send(`<script>alert("${msg}");${addScript}</script>`);
	},
	
	/**
		페이지 이동
		
		@param String url 이동할 경로
		@param Object res - Request 객체
		@param String target 이동할 창 self, parent
	*/
	go : function(url, res, target) {
		target = target || "self";
		return res.send (`<script>${target}.location.href='${url}';</script>`);
		
		},
};

module.exports = commonLib;