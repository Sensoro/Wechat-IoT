var config = require('config');
var weixin = require('../util/weixin');

var appid = config.weixin.appid;

module.exports = function(app){

  /**
   * jssdk 签名， 供H5页面调用
   *
   * @param {String} url H5 当前页面的 url（去掉 hash）
   */

   // 缓存 code 对应的 openid，以免页面刷新后获取不到 openid
  var codeMap = {};
  var getOpenid = function(code, callback) {
    if (codeMap[code]) {
      return callback(null, codeMap[code]);
    }
    weixin.api.getOauthAccessToken(appid, code, function(err, data){
      var openid = data && data.openid;
      if (openid) {
        codeMap[code] = openid;
      }
      return callback(err, openid);
    });
  };

  app.get('/sign', function(req, res){
    var url = req.query.url;
    var code = req.query.code;
    if (!url) {
      return res.status(400).json({errMsg: "need url"});
    }
    url = decodeURIComponent(url);
    // 若有 code，说明用户是通过授权近入的页面，通过接口那个用户的 openid，页面绑定设备时需用
    if (code) {
      getOpenid(code, function(err, openid){
        weixin.api.getTicketToken(function(err, token){
          if (!token) return res.json({});
          var ret = weixin.util.getJsConfig(token.ticket, url);
          ret.appid = config.weixin.appid;
          ret.openid = openid;
          console.log('token:  ', token);
          console.log('signData:  ', ret);
          res.json(ret);
        });        
      });
    } else {
      weixin.api.getTicketToken(function(err, token){
        if (!token) return res.json({});
        var ret = weixin.util.getJsConfig(token.ticket, url);
        ret.appid = config.weixin.appid;
        console.log('token:  ', token);
        console.log('signData:  ', ret);
        res.json(ret);
      });
    }
  });

  /**
    * 绑定设备
    *
    * @param {String} openid 微信用户的 openid
    * @param {String} deviceid 设备 id
    * @param {String} ticket H5 页面生成的 ticket（若没有此参数则强制绑定）
    */
  app.post('/bind', function (req, res) {
    var openid = req.body.openid;
    var deviceid = req.body.deviceid;
    var ticket = req.body.ticket;
    if (!openid || !deviceid) {
      return res.status(400).json({errmsg: 'Parameter error'});
    }
    if (ticket) {
      weixin.api.bindDevice(appid, deviceid, openid, ticket, function(err){
        if (err) {
          return res.json(400).json({errMsg: 'Bind failure', info: JSON.stringify(err)});
        }
        res.json('ok');
      });
    } else { // 强制绑定
      weixin.api.compelBindDevice(appid, deviceid, openid, function(err){
        if (err) {
          return res.json(400).json({errMsg: 'Bind failure', info: JSON.stringify(err)});
        }
        res.json('ok');
      });
    }
  });

  /**
    * 解绑设备
    *
    * @param {String} openid 微信用户的 openid
    * @param {String} deviceid 设备 id
    * @param {String} ticket H5 页面生成的 ticket（若没有此参数则强制解绑）
    */
  app.post('/unbind', function(req, res){
    var ticket = req.body.ticket;
    var openid = req.body.openid;
    var deviceid = req.body.deviceid;
    if (!openid || !deviceid) {
      return res.status(400).json({errmsg: 'Parameter error'});
    }
    if (ticket) {
      weixin.api.unbindDevice(appid, deviceid, openid, ticket, function(err){
        if (err) {
          return res.json(400).json({errMsg: 'Bind failure', info: JSON.stringify(err)});
        }
        res.json('ok');
      });
    } else { // 强制绑定
      weixin.api.compelUnbindDevice(appid, deviceid, openid, function(err){
        if (err) {
          return res.json(400).json({errMsg: 'Bind failure', info: JSON.stringify(err)});
        }
        res.json('ok');
      });
    }      
  });

};