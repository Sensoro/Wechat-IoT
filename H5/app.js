var path = require('path');
var express = require('express');
var config = require('config');
var ejs = require('ejs');
var morgan = require('morgan');

/**
 * 公众号基础接口库 
 */
var wx = require("./middlewares/wx")({
  token: config.weixin.token,
  app_id: config.weixin.app_id,
  app_secret: config.weixin.app_secret,
  redis_options: {
    host: config.redis.host,
    port: config.redis.port
  }
});

/**
 * 公众号蓝牙硬件接口 api 库
 */
var wxDevice = require('weixin-device');
for(var prot in wxDevice){
  wx[prot] = wxDevice[prot];
}

var app = express();
app.set('port', process.env.PORT || 5001);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(morgan('combined'));
app.use(require('./middlewares/body')());

app.use('/wechat', wx);

app.get("/", function(req, res, next){
  res.render('index');
});

require('./route/wechat')(wx);

require('./route/handle')(app, wx);

app.get('/*', function(req, res, next){
  res.redirect('/');
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* jshint unused:false */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      env: 'development',
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

var server = app.listen(app.get('port'), function(a, b){
  console.log('weixin server listening on port ' + server.address().port);
});
