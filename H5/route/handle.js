var request = require('request');
var config = require('config');
var sign = require('../util/sign');
var redis = require('redis');
var _ = require('underscore');
var db = redis.createClient(config.redis.port, config.redis.host);

module.exports = function(app, wx){

  // 获取签名
  app.get('/sign', function(req, res){
    var url = req.query.url;
    if(url) url = decodeURIComponent(url);
    var code = req.query.code;
    var access_token = wx.access_token();
    if(!url) return res.json(400, {errMsg: "need url"});
    if(!access_token) return res.json(400, {errMsg:'access_token empty'});
    getTicket(access_token, function(err, ticket){
      if(err) return res.json(400, err);
      var ret = sign(ticket, url);
      ret.appid = config.weixin.app_id;
      if(!code) return res.json(ret);
      request.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+config.weixin.app_id+'&secret='+config.weixin.app_secret+'&code='+code+'&grant_type=authorization_code',function(err, r, body){
        if(body) {
          try{
            body = JSON.parse(body);
          }catch(e){
            console.log(e);
          }
        }
        if(body && body.openid) ret.openid = body.openid;
        res.json(ret);
      });
    });
  });

  // 绑定设备
  app.post('/bind', function(req, res){
    var ticket = req.body.ticket;
    var openid = req.body.openid;
    var deviceid = req.body.deviceid;
    if(!openid) return res.status(400).json({msg: 'need openid'});
    if(!deviceid) return res.status(400).json({msg: 'need deviceid'});
    if(!ticket) return res.status(400).json({msg: 'need ticket'});
    var options = {
      access_token:wx.access_token(),
      data: {
        ticket: ticket,
        device_id: deviceid,
        openid: openid
      }
    };
    wx.bind(options, function(err, ret){
      if(err) {
        console.log(err);
        return res.json(400, err);
      }
      res.json('ok');
    });
  });

  // 解绑设备
  app.post('/unbind', function(req, res){
    var ticket = req.body.ticket;
    var openid = req.body.openid;
    var deviceid = req.body.deviceid;
    var options = {
      access_token:wx.access_token(),
      data: {
        ticket: ticket,
        device_id: deviceid,
        openid: openid
      }
    };
    wx.unbind(options, function(err, ret){
      if(err) {
        console.log(err);
        return res.json(400, err);
      }
      res.json('ok');
    });
  });

};

function getTicket(access_token, cb){
  db.get("WX:jsapi:ticket", function(err, ticket){
    if(err) return cb(err);
    if(ticket) return cb(null, ticket);
    request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi", function(err, res, body){
      if(err) {
        console.log(err);
        return cb(err);
      }
      if(typeof body === "string"){
        try{
          body = JSON.parse(body);
        }catch(e){
          console.error("body parse error: ", e);
        }
      }
      var _ticket = body.ticket;
      var exp = Number(body.expires_in) || 7200;
      exp = exp - 60;
      if(!_ticket) return cb("get ticket error");
      db.setex("WX:jsapi:ticket", exp, _ticket, function(err){
        if(err) return cb(err);
        return cb(null, _ticket);
      });
    });
  });
}
