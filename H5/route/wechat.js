var config = require('config');
var base64 = require('base64');
var gb2312 = require('encode-gb2312');

module.exports = function(wx){

  var user_devices_map = {}; // 设备与用户的对应关系

  (function createMenu(cb){
    if(!wx.access_token()) {
      return setTimeout(createMenu, 100);
    }
    cb = cb || function(){};
    var buttons = [
      {
        "name": "官网",
        "type": "view",
        "url": "http://www.sensoro.com"
      },
      {
        "name": "订购",
        "type": "view",
        "url": "http://www.sensoro.com/zh/order"
      },
      {
        "name": "微信硬件之旅",
        "type": "view",
        "url" : "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + config.weixin.app_id + "&redirect_uri=http://app.imapp.net?action=viewtest&response_type=code&scope=snsapi_base&state=1#wechat_redirect"
      }
    ];
    wx.create_menu(buttons, cb);
  })();

  wx.subscribe(function(req, res){
    var nickname = req.user.nickname;
    var news = [
      {
        title: 'SENSORO IOT 开发者套件',
        description: 'SMART TAG KIT，开启智能硬件的微信之旅。',
        pic_url: 'http://mmbiz.qpic.cn/mmbiz/MLoSLUepSAUicFkVMvrXopwgDYk1ibnQPSdDedFDc4LqDhIpicHoCSSKpEpwrSmIYTc1iakPIicInib9cwG9wuFhFeOw/640?wx_fmt=jpeg&tp=webp&wxfrom=5',
        url: 'http://mp.weixin.qq.com/s?__biz=MzA4NzY0NzIwNA==&mid=208501245&idx=1&sn=cd8d02239a6d0676a38475bdd3578db0&key=1936e2bc22c2ceb56109026562aab17ea5e7d58279452994c7598f38d5f5dd4c422fe0d1b7649f82fa210bfcde5e14f6&ascene=0&uin=MTA1ODcyNTU0MQ%3D%3D&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.10.3+build(14D136)&version=11000006&pass_ticket=yFB37OPAOKmVAr206aivWMLsyB3oXYkw1tgl2Wdqw%2FGHrXsigb%2FgTlg129q5Kg0N'
      }
    ];
    res.news(news)
  });

  wx.text(/\S/, function(req, res){
    var openid = req.user.openid;
    var content = req.content;
    if(!content) return res.text();
    content = content.trim();
    var content_lower = content.toLowerCase();
    if(content_lower.indexOf('device:') === 0 || content_lower.indexOf('device：') === 0){
      var deviceid = content.replace('device:', '');
      deviceid = content.replace('device：', '');
      if(deviceid) deviceid = deviceid.trim();
      user_devices_map[openid] = deviceid;
      res.text('现在可以往设备: ' + deviceid + ' 上发送消息了。');
    }else if(content_lower === 'list'){
      res.text("设备列表");
      wx.getBindDeviceId({access_token:wx.access_token(), data:{openid:req.user.openid}}, function(err, ret){
        var devices = ret.device_list;
        var ds = "";
        for(var i=0; i<devices.length; i++){
          ds += ("\n" + devices[i].device_id);
        }
        req.user.text(ds);
      });
    }else if(content_lower.indexOf("iot:") === 0 || content_lower.indexOf("iot：") === 0){
      content = content.replace('iot:', '').trim();
      content = content.replace('iot：', '').trim();
      if(!user_devices_map[openid]){
        res.text('没有找到此用户配置设备，请重新配置');
      }else {
        var buff = gb2312(content);
        if(!buff){
          return res.text('命令不能为空!');
        }
        var data = {
          device_type: config.weixin.id,
          device_id: user_devices_map[openid],
          open_id: openid,
          content: buff + "\n"
        };
        res.text('已发送数据: ' + content + "  GB2312码为： " + buff);
        console.log(data);
        wx.transmsg({access_token:wx.access_token(), data:data}, function(err, ret){
          if(err){
            return req.user.text("给设备写数据失败: " + JSON.stringify(err));
          }
          req.user.text('写入成功');
        });
      }
    }else {
      res.text('我们暂时还没有开通微信客服服务，有问题请联系电话客服：1111111');
      //res.transfer(); // 转客服
    }
  });

  wx.device(function(req, res){
    //res.device(new Buffer("1111", "hex"));
    var content = req.content;
    if(content) {
      content = content.trim();
      content = base64.decode(content);
    }
    var id = req.device_id;
    req.user.text(id + (content ? (" 说 :   " + content) :  ' :   什么都不想说'));
  });

};
