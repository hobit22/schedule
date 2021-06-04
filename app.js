const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const logger = require("./lib/logger");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { sequelize } = require('./models');
const { loginSession } = require("./middlewares/login_session");

/** 라우터 */
const indexRouter = require('./routes');
const memberRouter = require("./routes/member");

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);

/** nunjucks 세팅 */
app.set('view engine', 'html');
nunjucks.configure('views', {
	express : app,
	watch : true,
});

/** sequelize 세팅 */
sequelize.sync({force : false })
	.then(()=>{
		logger(`데이터베이스 연결 성공`);
	})
	.catch((err)=>{
		logger(err.message, 'error');
		logger(err.stack, 'error');
	});

if(process.env.NODE_ENV == 'production'){
	app.use(morgan('combine'));
}else{
	app.use(morgan('dev'));
}

/** 정적 페이지 */
app.use(express.static(path.join(__dirname, 'public'))); //js css 추가를 쉽게 하기 위해서

/** body parser */
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

//쿠키 설정
app.use(cookieParser(process.env.COOKIE_SECRET));

//세션 설정 

app.use(session({
	resave : false,
	saveUninitialized : true,
	cookie : {
		httpOnly : true, 
		secure : false,
	},
	name : "HBsession",
}));

app.use(loginSession);

/** 라우터 등록 */
app.use("/member", memberRouter);
app.use(indexRouter); // "/" 기본 URL 생략 가능


/** 없는 페이지 처리 */
app.use((req,res,next)=>{
	const error = new Error(`${req.method} ${req.url}는 없는 페이지 입니다.`);
	error.status = 404;
	next(error);
});


/** 오류 처리 */
app.use((err,req,res,next) =>{
	
	err.status = err.status || 500; 
	const message = `${err.status} ${err.message}`;
	logger(message, 'error'); //로그에 에러 기록
	
	logger(err.stack, 'error'); //로그에 스택 기록	
	
	if(process.env.NODE_ENV == 'production') err.stack = {}; // production 일때 stack 출력 안되게 처리
	
	res.locals.error = err;
	res.status(err.status).render('error'); //에러 페이지 출력
});

app.listen(app.get('port'), ()=>{
	console.log(app.get('port'), '번 포트에서 대기중');
});

