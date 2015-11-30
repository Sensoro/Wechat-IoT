var path = require('path');
var fs = require('fs');
var config = require('config');
var gb2312 = require('encode-gb2312');

var accessTokenFile = path.join(__dirname, '../access_token.txt');

if (!fs.existsSync(accessTokenFile)) {
  fs.appendFileSync(accessTokenFile, '', {encoding: 'utf8'});
}

var jsApiTicketFile = path.join(__dirname, '../jsapi_ticket.txt');

if (!fs.existsSync(jsApiTicketFile)) {
  fs.appendFileSync(jsApiTicketFile, '', {encoding: 'utf8'});
}

var noop = function(){};

var weixin = require("weixin-trap")({
  getBody: false,
  parseXml: false,
  populate_user: false, 
  attrNameProcessors: 'underscored',
  saveToken: function(token, callback){
    token.saveTime = new Date().getTime();
    var tokenStr = JSON.stringify(token);
    fs.writeFile(accessTokenFile, tokenStr, {encoding: 'utf8'}, callback);
  },
  getToken: function(callback){
    fs.readFile(accessTokenFile, {encoding: 'utf8'}, function(err, str){
      var token;
      if (str) {
        token = JSON.parse(str);
      }
      var time = new Date().getTime();
      if (token && (time - token.saveTime) < ((token.expireTime - 120) * 1000) ) {
        return callback(null, token);
      }
      callback();
    });
  },
  saveTicketToken: function(appid, type, token, callback) {
    token.saveTime = new Date().getTime();
    var tokenStr = JSON.stringify(token);
    fs.writeFile(jsApiTicketFile, tokenStr, {encoding: 'utf8'}, callback);
  },
  getTicketToken: function(callback) {
    fs.readFile(jsApiTicketFile, {encoding: 'utf8'}, function(err, str){
      var token;
      if (str) {
        token = JSON.parse(str);
      }
      var time = new Date().getTime();
      if (token && (time - token.saveTime) < ((token.expireTime - 120) * 1000) ) {
        return callback(null, token);
      }      
      weixin.api.getTicket(config.weixin.id, 'jsapi', function(err, token){
        if (err) {
          console.log('获取 jsapi 签名出错:  ', err);
        }
        callback(null, token);
      });
    });  
  },
  config: {
    id: config.weixin.id, // 微信公众号 id
    appid: config.weixin.appid,
    token: config.weixin.token,
    appsecret: config.weixin.appsecret,
    encryptkey: config.weixin.encryptkey // 若公众号配置加密 key，则必填此参数
  }
});

var appid = config.weixin.appid;

var menu = {
  button: [
      {
        name: '官网',
        type: 'view',
        url: 'http://www.sensoro.com'
      },
      {
        name: '订购',
        type: 'view',
        url: 'http://www.sensoro.com/zh/order'
      },
      {
        'name': '微信硬件之旅',
        'type': 'view',
        'url' : 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + config.demoUrl + '?action=viewtest&response_type=code&scope=snsapi_base&state=1#wechat_redirect'
      }
    ]
};
// 创建菜单
weixin.api.createMenu(appid, menu, function(err, ret){
  if (err){
    console.log('创建菜单失败: ' + JSON.stringify(err));
  } else {
    console.log('创建菜单成功');
  }
});

/**
  * 用户关注公众号时给用户推送一条图文消息
  */
weixin.trap.subscribe(function(req, res){
  var news = [
    {
      title: 'SENSORO IOT 开发者套件',
      description: 'SMART TAG KIT，开启智能硬件的微信之旅。',
      pic_url: 'http://mmbiz.qpic.cn/mmbiz/MLoSLUepSAUicFkVMvrXopwgDYk1ibnQPSdDedFDc4LqDhIpicHoCSSKpEpwrSmIYTc1iakPIicInib9cwG9wuFhFeOw/640?wx_fmt=jpeg&tp=webp&wxfrom=5',
      url: 'http://mp.weixin.qq.com/s?__biz=MzA4NzY0NzIwNA==&mid=208501245&idx=1&sn=cd8d02239a6d0676a38475bdd3578db0&key=1936e2bc22c2ceb56109026562aab17ea5e7d58279452994c7598f38d5f5dd4c422fe0d1b7649f82fa210bfcde5e14f6&ascene=0&uin=MTA1ODcyNTU0MQ%3D%3D&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.10.3+build(14D136)&version=11000006&pass_ticket=yFB37OPAOKmVAr206aivWMLsyB3oXYkw1tgl2Wdqw%2FGHrXsigb%2FgTlg129q5Kg0N'
    }
  ];
  res.news(news);
});

// 缓存用户想要控制的设备 ID 对应关系
var user_devices_map = {};

/**
 * 处理微信用户发送到公众号的文本消息
 *
 * 用户可以直接通过微信公众号界面输入框控制设备
 */
weixin.trap.text(/\S/, function(req, res){
  var wechat_id = req.body.to_user_name;
  var openid = req.body.from_user_name;
  var content = req.body.content;
  if(!content) return res.text('');
  content = content.trim();
  var content_lower = content.toLowerCase();
  // 微信用户必须首先告诉系统想要控制的设备 id
  // example:   device:123456
  // 控制设备 ID 为 123456 的蓝牙涉笔
  if (content_lower.indexOf('device:') === 0 || content_lower.indexOf('device：') === 0) {
    var deviceid = content_lower.replace('device:', '').replace('device：', '').trim();
    user_devices_map[openid] = deviceid;
    res.text('现在可以往设备: ' + deviceid + ' 上发送消息了。');
  } else if(content_lower === 'list') {
    // 列表用户绑定的设备
    // example: list
    res.text('设备列表');
    weixin.api.getBindDevice(appid, openid, function(err, ret){
      var devices = ret.device_list;
      var ds = '';
      for(var i=0; i<devices.length; i++){
        ds += ('\n' + devices[i].device_id);
      }
      weixin.api.sendText(appid, openid, ds, noop);
    });
  } else if(content_lower.indexOf('iot:') === 0 || content_lower.indexOf('iot：') === 0) {
    // 给设备发送指令
    // example: iot:test
    content = content.replace('iot:', '').trim();
    content = content.replace('iot：', '').trim();
    if (!user_devices_map[openid]) {
      return res.text('没有找到此用户配置设备，请重新配置');
    }

    if (!content) {
      return res.text('命令不能为空!');
    }

    var device_id = user_devices_map[openid];
    var buff = gb2312(content) + '\n';
    res.text('已发送数据: ' + content + "  GB2312码为： " + buff);

    weixin.api.transferMessage(appid, wechat_id, device_id, openid, buff, function(err, ret){
      var replyText = '写入成功';
      if (err){
        replyText = '给设备写数据失败: ' + JSON.stringify(err);
      }
      return weixin.api.sendText(appid, openid, replyText, noop);
    });
  } else {
    res.text('我们暂时还没有开通微信客服服务，有问题请联系电话客服：1111111');
    //res.transfer(); // 转客服
  }
});

/**
 * 接受设备发送到的消息并回复
 */
weixin.trap.device(function(req, res){
  res.device(new Buffer("1111", "hex")); // 响应设备
  var openid = req.body.from_user_name;
  var content = req.body.content;
  if(content) {
    content = content.trim();
    content = new Buffer(content, 'base64').toString();
  }
  var id = req.body.device_id;
  var replyText = id + ' 说:  ';
  if (content) {
    replyText += content;
  } else {
    replyText += '什么都不想说';
  }
  weixin.api.sendText(appid, openid, replyText, noop);
});

module.exports = weixin;