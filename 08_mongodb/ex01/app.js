var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');

var index = require('./routes/index');   //전체적인것 담당
var users = require('./routes/users');   //user 밑에 있는거 담당
var questions = require('./routes/questions'); 
//router     

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
if (app.get('env') === 'development') {
  app.locals.pretty = true;
}

// Pug의 local에 moment라이브러리와 querystring 라이브러리를 사용할 수 있도록.
app.locals.moment = require('moment');
app.locals.querystring = require('querystring');

//=======================================================
// mongodb connect
//=======================================================
mongoose.Promise = global.Promise; // ES6 Native Promise를 mongoose에서 사용한다.
// const connStr = 'mongodb://localhost/mjdb1';   //몽고디비 안에 여러게의 디비이름중 하나 
// 아래는 mLab을 사용하는 경우의 예: 본인의 접속 String으로 바꾸세요.
const connStr = 'mongodb+srv://user1:<password>@cluster0-wgesx.gcp.mongodb.net/test?retryWrites=true&w=majority';   //cloud에서 돌때 마지막 플젝할때
mongoose.connect(connStr, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.connection.on('error', console.error);

// Favicon은 웹사이트의 대표 아이콘입니다. Favicon을 만들어서 /public에 둡시다.
// https://www.favicon-generator.org/ 여기서 만들어볼 수 있어요.
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// _method를 통해서 method를 변경할 수 있도록 함. PUT이나 DELETE를 사용할 수 있도록.
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));   // put/post밖에 못보내는데 -method=put/delete으로 강제로 delete랑 put등으로 overide해줌

// sass, scss를 사용할 수 있도록
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  debug: true,
  sourceMap: true
}));

// session을 사용할 수 있도록.
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));

app.use(flash()); // flash message를 사용할 수 있도록   ex) 성공적으로 세션에 뭐 ..도착했습니다 이렇게 띄워주는거 

// public 디렉토리에 있는 내용은 static하게 service하도록.
app.use(express.static(path.join(__dirname, 'public')));

// pug의 local에 현재 사용자 정보와 flash 메시지를 전달하자.
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.user;
  res.locals.flashMessages = req.flash();      //
  next();
});

// Route
app.use('/', index);    //'/'패턴은 index가 '/users'는 users가 처리하게끔
app.use('/users', users);
app.use('/questions', questions);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;    //error메세지 출력
  res.locals.error = req.app.get('env') === 'development' ? err : {};  //내 local에서만 일단 수정

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
