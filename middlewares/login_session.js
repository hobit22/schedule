const { alert, go } = require("../lib/common");

module.exports.loginSession = (req,res,next) =>{
	req.isLogin = res.isLogin = res.locals.isLogin = false;
	if(req.session.memId){
		req.isLogin = res.isLogin = res.locals.isLogin = true;
	}
	console.log(req.isLogin);
	next();
};

