;(function(window, undefined) {
  var url = location.href.replace(location.hash, "");
  url = encodeURIComponent(url);
  var vm, signData, openid, voice = {
    localId: '',
    serverId: ''
  }; // 语音录制内容
  var reg = /(。|，|！|：|；|？)/g; // 语音解析的正则表达式,微信解析语音后会再后面加上一个标点符号
  var mobile = (window.navigator.userAgent.toLowerCase().indexOf("android") > -1) ? 'android' : 'iphone';
  var is_nexus5 = (window.navigator.userAgent.replace(/ /g, "").toLowerCase().indexOf("nexus5") > -1);
  var retry_count = 5;

  if (mobile === 'android') {
    $(".text-input .input-box").css("margin-top", "10px");
    $(".text-input .input-box input").css("height", "25px");
    $(".text-input .send button").css("margin-top", "15px");
    $(".text-input .voice-icon").css("margin-top", "11px");
  }

  if (is_nexus5) {
    $(".text-input .voice-btn").text("点击 说话");
  }


  var code = getQueryString('code');

  $.get(baseUrl + "/sign?url=" + url + "&code=" + code, function(data) {
    openid = data.openid;
    signData = {
      "verifyAppId": data.appid,
      "verifyTimestamp": data.timestamp,
      "verifySignType": "sha1",
      "verifyNonceStr": data.nonceStr,
      "verifySignature": data.signature
    };
    wx.config({
      debug: false,
      appId: data.appid,
      timestamp: data.timestamp,
      nonceStr: data.nonceStr,
      signature: data.signature,
      jsApiList: [
        'openWXDeviceLib',
        'closeWXDeviceLib',
        'getWXDeviceInfos',
        'getWXDeviceTicket',
        'getWXDeviceBindTicket',
        'getWXDeviceUnbindTicket',
        'setSendDataDirection',
        'startScanWXDevice',
        'stopScanWXDevice',
        'connectWXDevice',
        'disconnectWXDevice',
        'sendDataToWXDevice',
        'chooseImage',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice'
      ]
    });
  });

  // 获取url上的query内容
  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]);
    return null;
  }

  /**
   * 初始化
   *
   */
  function init() {
    //checkJsApi();
    openWXDeviceLib(function(err) {
      getWXDeviceInfos(function(err, devices) {
        if (err) showDialog(JSON.stringify(err));
        $('.busy').hide();
        vm.$data.progress = 'complete';
        setDeviceData(devices);
      });
    });
  }

  // 微信接口config完成
  wx.ready(function() {
    init();

    // 设备绑定状态发生变化
    WeixinJSBridge.on('onWXDeviceBindStateChange', function(argv) {
      //alert("bindChange:" + JSON.stringify(argv));
    });

    // 设备连接状态发生变化
    WeixinJSBridge.on('onWXDeviceStateChange', function(argv) {
      if (!argv) return;
      var flag = false;
      for (var i = 0; i < vm.$data.devices.length; i++) {
        if (vm.$data.devices[i].deviceId === argv.deviceId) {
          flag = true;
          vm.$data.devices[i].state = argv.state || 'disconnected';
        }
      }
      if (!flag) {
        vm.$data.devices[i].push(argv);
      }
      var el;
      if (argv.state === 'connecting') {
        el = $("#" + deviceId + " #connect");
        el.text("");
        el.addClass('loading');
      } else if (argv.state === 'connected') {
        el = $("#" + deviceId + " #connect");
        el.text("连接");
        el.removeClass('loading');
      }
    });

    WeixinJSBridge.on('onReceiveDataFromWXDevice', function(argv) {
      alert("receiveData: " + JSON.stringify(argv));
    });

    WeixinJSBridge.on('onWXDeviceBluetoothStateChange', function(argv) {
      if (avgv.state === 'off') {
        alert("请打开手机蓝牙");
      } else {
        alert("init");
        init();
      }
    });

    // 扫描到设备
    WeixinJSBridge.on('onScanWXDeviceResult', function(argv) {
      if (!argv) return;
      var devices = argv.devices;
      if (!devices || devices.length === 0) return;
      for (var i = 0; i < devices.length; i++) {
        var id = devices[i].deviceId;
        var flag = _.find(vm.$data.devices, function(d) {
          return d.deviceId === id;
        });
        var obj = {
          deviceId: id
        };
        if (!flag) vm.$data.devices.push(obj);
      }
    });


  });

  // 微信config失败
  wx.error(function(res) {
    alert(JSON.stringify(res));
  });

  // 排序
  Vue.filter('sortList', function(value) {
    if (!value || value.length === 0) return value;
    var arr1 = [],
      arr2 = [],
      arr3 = [];
    _.each(value, function(v) {
      if (v.state === 'connected' || v.state === 'connecting') {
        arr1.push(v);
      } else if (v.state === 'disconnected') {
        arr2.push(v);
      } else {
        arr3.push(v);
      }
    });

    arr1 = _.sortBy(arr1, function(a1) { return a1.deviceId; });
    arr2 = _.sortBy(arr2, function(a2) { return a2.deviceId; });
    arr3 = _.sortBy(arr3, function(a3) { return a3.deviceId; });
    return arr1.concat(arr2, arr3);
  });

  // id如果太长，截断显示
  Vue.filter('truncation', function(value) {
    if (!value) return 'undefined';
    if(value.length < 17) return value;
    return value.slice(0, 14) + "...";
  });

  Vue.transition('fade', {
    beforeEnter: function(el) {},
    enter: function(el, done) {
      // element is already inserted into the DOM
      // call done when animation finishes.
      $(el)
        .css('opacity', 0)
        .css('height', 0)
        .animate({
          opacity: 1,
          height: 95
        }, 500, done);
      // optionally return a "cancel" function
      // to clean up if the animation is cancelled
      return function() {
        $(el).stop();
      };
    },
    leave: function(el, done) {
      // same as enter
      $(el).animate({
        opacity: 0,
        height: 0,
        padding: 0,
        margin: 0
      }, 500, done);
      return function() {
        $(el).stop();
      };
    }
  });


  renderView();

  function renderView() {
    vm = new Vue({
      el: '.container',
      data: {
        progress: 'complete',
        devices: [],
        currentDevice: "",
        deviceid: "",
        alias: "",
        debug_flag: false
      },
      methods: {
        debug: function() {
          //this.debug_flag = !this.debug_flag;
        },
        switchPage: function() { // 页面切换
          if ($(".show-container").is(":visible")) {
            $(".switch").text("查看说明书");
            $(".show-container").hide();
            $(".list").show();
          } else {
            $(".switch").text("返回主页面");
            $(".list").hide();
            $(".show-container").show();
          }
        },
        switchHandle: function() { // 语音和手动输入切换
          if ($(".text-input .icon-control i").hasClass('edit-icon')) {
            $(".text-input .icon-control i").removeClass('edit-icon');
            $(".text-input .icon-control i").addClass('voice-icon');
            $(".text-input .send").removeClass('hide');
            $(".text-input input").removeClass('hide');
            $(".text-input .voice-btn").addClass('hide');
          } else {
            $(".text-input .icon-control i").removeClass('voice-icon');
            $(".text-input .icon-control i").addClass('edit-icon');
            $(".text-input .send").addClass('hide');
            $(".text-input input").addClass('hide');
            $(".text-input .voice-btn").removeClass('hide');
          }
        },
        sendText: function(s) { // 发送数据到设备
          var o = _.find(vm.$data.devices, function(d) {
            return d.deviceId === vm.$data.currentDevice;
          });
          if (!o) return showDialog("未选择操作设备，请选择一个");
          if (!s) {
            s = $(".text-input input").val();
            $(".text-input input").val("");
            $(".text-input input").blur();
          }
          if (!s) return showDialog("命令不能为空!");
          var gb = encodeToGb2312(s) + "\n";
          var buf = Base64.encode(gb);
          if (this.debug_flag) showDialog("原始字符串: " + s + "  GB2312: " + gb, 5000);
          sendDataToWXDevice(o.deviceId, buf, function() {});
        },
        selectDevice: function(deviceId) { // 选择操作的设备
          var device = _.find(this.devices, function(d) {
            return d.deviceId === deviceId;
          });
          if (device.state !== 'connected') {
            return showDialog("设备未连接！");
          }
          this.currentDevice = deviceId;
        },
        stopScan: function() { // 停止扫描
          $("#startscan").show();
          $(".debug").show();
          $("#stopscan").hide();
          $(".scan-gif").hide();
          stopScanWXDevice(function(err) {
            if (err) showDialog(JSON.stringify(err), 5000);
          });
        },
        startScan: function() { // 开始扫描
          $("#stopscan").show();
          $("#startscan").hide();
          $(".debug").hide();
          $(".scan-gif").show();
          startScanWXDevice(function(err) {
            if (err) showDialog(JSON.stringify(err));
          });
        },
        bind: function(deviceId) { // 绑定设备
          var that = this;
          getWXDeviceTicket(deviceId, 1, function(err, ticket) {
            if (err) return showDialog(err);
            bindDevice(deviceId, ticket, function(err) {
              if (err){
                var msg = "绑定失败，请退出页面后从新从公众号进入页面再进行绑定操作";
                return showDialog(msg, 3000);
              }
              that.devices = _.map(that.devices, function(d) {
                if (d.deviceId === deviceId) {
                  return {
                    state: 'disconnected',
                    deviceId: deviceId
                  };
                } else {
                  return d;
                }
              });
            });
          });
        },
        unbind: function(deviceId) { // 解绑设备
          var that = this;
          if(confirm("解绑设备，解绑后将从列表删除！")){
            getWXDeviceTicket(deviceId, 2, function(err, ticket) {
              if (err) return showDialog(err);
              unbindDevice(deviceId, ticket, function(err) {
                if (err) return showDialog(err);
                that.devices = _.filter(that.devices, function(d) {
                  return d.deviceId !== deviceId;
                });
                if (that.currentDevice === deviceId && that.devices.length > 0) that.currentDevice = that.devices[0].deviceId;
              });
            });
          }
        },
        connect: function(deviceId, state) { // 连接设备
          if ($("#stopscan").is(":visible")) {
            this.stopScan();
          }
          if (state === "connected") {
            showDialog("设备已经连接");
          } else {
            var el = $("#" + deviceId + " #connect");
            el.text("");
            el.addClass('loading');
            connectWXDevice(deviceId, function(err) {
              el.text("连接");
              el.removeClass('loading');
              if (err) return showDialog(JSON.stringify(err));
            });
          }
        },
        disconnect: function(deviceId, state) { // 断开连接
          if ($("#stopscan").is(":visible")) {
            this.stopScan();
          }
          if (state === "disconnected") {
            showDialog("设备已经断开连接");
          } else {
            var el = $("#" + deviceId + " #disconnect");
            el.text("");
            el.addClass('loading');
            disconnectWXDevice(deviceId, function(err) {
              el.text("断开");
              el.removeClass('loading');
              if (err) return showDialog(JSON.stringify(err));
            });
          }
        },
      }
    });

    var _list = [{
      deviceId: '111111',
      state: 'connected'
    }, {
      deviceId: '222222',
      state: 'disconnected'
    }, {
      deviceId: '333333',
      state: 'connecting'
    }, {
      deviceId: '44444444444444444444444444444444444',
      state: 'connected'
    }];
    //setDeviceData(_list);

  }

  // 开始录音
  function startRecord() {
    $(".voice-btn").addClass("press");
    if (!is_nexus5) {
      showDialog("", 60000, function() {
        $(".dialog .dia-body").addClass('img-voice');
      });
    } else {
      showDialog("", 60000, function() {
        $(".dialog .dia-body").addClass('img-voice-nexus5');
      });
    }
    wx.startRecord({
      cancel: function() {
        showDialog('用户拒绝授权录音');
      }
    });
  }

  // 结束录音并解析
  function stopRecord() {
    $(".voice-btn").removeClass("press");
    hideDialog();
    wx.stopRecord({
      success: function(res) {
        voice.localId = res.localId;
        wx.translateVoice({
          localId: voice.localId,
          complete: function(res) {
            if (res.hasOwnProperty('translateResult')) {
              var s = res.translateResult;
              s = s.replace(reg, "");
              var o = _.find(vm.$data.devices, function(d) {
                return d.deviceId === vm.$data.currentDevice;
              });
              if (!o) return showDialog("未选择操作设备，请选择一个");
              var gb = encodeToGb2312(s) + "\n";
              var buf = Base64.encode(gb);
              if (vm.$data.debug_flag) showDialog("原始字符串: " + s + "    GB2312: " + gb, 5000);
              sendDataToWXDevice(o.deviceId, buf, function() {});
            } else {
              showDialog("无法识别");
            }
          }
        });
      },
      fail: function(err) {
        if (err.errMsg === "stopRecord:tooshort") {
          showDialog("时间太短，请重试");
        } else {
          showDialog(JSON.stringify(err));
        }
      }
    });
  }

  // 按下开始录音
  if (!is_nexus5) {
    $("body").on("touchstart", ".voice-btn", function(event) {
      $(".voice-btn").text("松开 结束");
      startRecord();
    });

    $("body").on("touchmove", ".voice-btn", function(event) {
      event.preventDefault();
    });


    $("body").on("touchcancel", ".voice-btn", function(event) {
      event.preventDefault();
      $(".voice-btn").text("按住 说话");
      stopRecord();
    });

    // 松开录音结束
    $("body").on("touchend", ".voice-btn", function(event) {
      event.preventDefault();
      $(".voice-btn").text("按住 说话");
      stopRecord();
    });
  }

  /** 
   * 对 nexus5做的定制
   * nexus5 在调用 wx.startRecord后不会触发 touchmove 和 touchend事件，直接触发了 touchcancel事件
   *
   */
  if (is_nexus5) {
    $("body").on("click", ".voice-btn", function(event) {
      if ($(".voice-btn").hasClass("press")) {
        $(".voice-btn").text("点击 说话");
        stopRecord();
      } else {
        $(".voice-btn").text("点击 结束");
        startRecord();
      }
    });
  }

  // 监听录音自动停止，超过一分钟则停止
  wx.onVoiceRecordEnd({
    complete: function(res) {
      $(".voice-btn").removeClass("press");
      hideDialog();
      voice.localId = res.localId;
      wx.translateVoice({
        localId: voice.localId,
        complete: function(res) {
          if (res.hasOwnProperty('translateResult')) {
            var s = res.translateResult;
            s = s.replace(reg, "");
            var o = _.find(vm.$data.devices, function(d) {
              return d.deviceId === vm.$data.currentDevice;
            });
            if (!o) return showDialog("未选择操作设备，请选择一个");
            var gb = encodeToGb2312(s) + "\n";
            var buf = Base64.encode(gb);
            if (vm.$data.debug_flag) showDialog("原始字符串: " + s + "    GB2312: " + gb, 5000);
            sendDataToWXDevice(o.deviceId, buf, function() {});
          } else {
            showDialog("无法识别");
          }
        }
      });
    }
  });

  // 监听录音播放结束
  wx.onVoicePlayEnd({
    complete: function(res) {
      showDialog('录音播放结束');
    }
  });


  /*
   * jsapi接口的封装
   */
  function checkJsApi() {
    wx.checkJsApi({
      jsApiList: ['getWXDeviceTicket'],
      success: function(res) {
        //alert(JSON.stringify(res));
      }
    });
  }

  // 列表添加设备
  function setDeviceData(devices) {
    if (devices && devices.length > 0) {
      $('.no-device').addClass('hide');
      for (var i = 0; i < devices.length; i++) {
        var obj = devices[i];
        if (!vm.$data.currentDevice && obj.state === 'connected') {
          vm.$data.currentDevice = obj.deviceId;
        }
        var flag = _.find(vm.$data.devices, function(d) {
          return d.deviceId === obj.deviceId;
        });
        if (!flag) vm.$data.devices.push(obj);
      }
    }
  }

  function openWXDeviceLib(cb) {
    WeixinJSBridge.invoke('openWXDeviceLib', signData, function(res) {
      if (res.err_msg === 'openWXDeviceLib:ok') return cb(null, 'ok');
      return cb(res);
    });
  }

  function closeWXDeviceLib(cb) {
    WeixinJSBridge.invoke('closeWXDeviceLib', signData, function(res) {
      if (res.err_msg === 'closeWXDeviceLib:ok') return cb(null, 'ok');
      return cb(res);
    });
  }


  function getWXDeviceInfos(cb) {
    WeixinJSBridge.invoke('getWXDeviceInfos', signData, function(res) {
      if (res.err_msg === 'getWXDeviceInfos:ok') return cb(null, res.deviceInfos);
      return cb(res);
    });
  }

  function connectWXDevice(deviceId, cb) {
    var _data = mixin({
      "deviceId": deviceId
    }, signData);
    WeixinJSBridge.invoke('connectWXDevice', _data, function(res) {
      if (res.err_msg === 'connectWXDevice:ok') return cb(null, null);
      return cb(res);
    });
  }

  function disconnectWXDevice(deviceId, cb) {
    var _data = mixin({
      "deviceId": deviceId
    }, signData);
    WeixinJSBridge.invoke('disconnectWXDevice', _data, function(res) {
      if (res.err_msg && res.err_msg.toLowerCase() === 'disconnectwxdevice:ok') return cb(null, null);
      return cb(res);
    });
  }

  var send_flag = false;

  function sendDataToWXDevice(deviceId, buf, cb) {
    var _data = mixin({
      "deviceId": deviceId,
      "base64Data": buf
    }, signData);
    if (send_flag && retry_count > 0) {
      retry_count--;
      return setTimeout(function() {
        sendDataToWXDevice(deviceId, buf, cb);
      }, 0);
    } else if (send_flag && retry_count <= 0) {
      send_flag = false;
      sendDataToWXDevice(deviceId, buf, cb);
      retry_count = 5;
    }
    send_flag = true;
    WeixinJSBridge.invoke('sendDataToWXDevice', _data, function(res) {
      send_flag = false;
      retry_count = 5;
      if (res.err_msg === 'sendDataToWXDevice:ok') return cb(null, null);
      return cb(res);
    });
  }

  function startScanWXDevice(cb) {
    var _data = mixin({
      btVersion: 'ble'
    }, signData);
    WeixinJSBridge.invoke('startScanWXDevice', _data, function(res) {
      if (res.err_msg === 'startScanWXDevice:ok') return cb(null, 'ok');
      cb(res);
    });
  }

  function stopScanWXDevice(cb) {
    WeixinJSBridge.invoke('stopScanWXDevice', signData, function(res) {
      if (res.err_msg === 'stopScanWXDevice:ok') return cb(null, 'ok');
      cb(res);
    });
  }

  function getWXDeviceTicket(deviceId, type, cb) {
    var _data = mixin({
      "deviceId": deviceId,
      type: type
    }, signData);
    WeixinJSBridge.invoke('getWXDeviceTicket', _data, function(res) {
      if (res.err_msg === 'getWXDeviceTicket:ok') return cb(null, res.ticket);
      return cb(res);
    });
  }

  function bindDevice(deviceId, ticket, cb) {
    $.ajax({
      url: baseUrl + "/bind",
      type: 'POST',
      data: {
        openid: openid,
        deviceid: deviceId,
        ticket: ticket
      },
      dataType: 'json',
      success: function(data) {
        cb(null, data);
      },
      error: function(err){
        cb(err.responseText);
      }
    });
  }

  function unbindDevice(deviceId, ticket, cb) {
    $.post(baseUrl + "/unbind", {
      openid: openid,
      deviceid: deviceId,
      ticket: ticket
    }, function(data) {
      if (data === 'ok') {
        return cb(null, null);
      }
      return cb(data);
    });
  }


  // 工具集
  function mixin(dest, src) {
    Object.getOwnPropertyNames(src).forEach(function(name) {
      var descriptor = Object.getOwnPropertyDescriptor(src, name);
      Object.defineProperty(dest, name, descriptor);
    });
    return dest;
  }

  var dialog_timer = null;

  function showDialog(msg, time, fn) {
    time = time ? (Number(time) || 1000) : 1000;
    $(".dialog .dia-body").text(msg);
    $(".dialog .dia-body").removeClass('img-voice');
    $(".dialog .dia-body").removeClass('img-voice-nexus5');
    if (typeof fn === "function") fn();
    var top = 0;
    if (msg) {
      len = msg.replace(/[^\x00-\xff]/g, "xx").length;
      if (len <= 16) {
        top = 40;
      } else if (len <= 32) {
        top = 30;
      } else if (len <= 46) {
        top = 22;
      } else if (len <= 62) {
        top = 10;
      }
    }
    $(".dialog-content .dia-body").css("margin-top", top);
    $(".dialog").show();
    if (dialog_timer) {
      clearTimeout(dialog_timer);
      dialog_timer = null;
    }
    dialog_timer = setTimeout(hideDialog, time);
  }

  function hideDialog() {
    $(".dialog").hide();
    $(".dialog .dia-body").text("");
    $(".dialog .dia-body").removeClass('img-voice');
    $(".dialog .dia-body").removeClass('.img-voice-nexus5');
    $(".dialog-content .dia-body").css("margin-top", 0);
    if (dialog_timer) clearTimeout(dialog_timer);
    dialog_timer = null;
  }

  $("body").on("click", ".dialog .dia-header .close", function() {
    $(".dialog").hide();
    $(".dialog .dia-body").text("");
    $(".dialog .dia-body").removeClass("img-voice");
  });

  function showModal() {
    $(".modal").show();
  }

  function hideModal() {
    $(".modal").hide();
  }

  $("body").on("click", ".modal .modal-header .close, .close-btn", function() {
    hideModal();
  });


  window.onload = function() {　
    $('.container').removeClass('hidden');
  };

})(window);
