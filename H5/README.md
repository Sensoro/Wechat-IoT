# wechat-iot-example
微信 IOT 蓝牙硬件设备操作 Demo

##### 获取代码并安装项目依赖的库

```
		git clone git@github.com:liuxiaodong/wechat-iot-example.git  
		
		npm install
		
		cd public && bower install
```

##### 修改配置文件

```
	cp config/_sample.json config/development.json
	
	修改 development.json 中的配置项为自己公众号的 appid 和 appsecret
	
	cp public/scripts/config_sample.js public/scripts/config.js
	修改 config.js 文件中变量 baseUrl 为自己服务器地址 
```

##### 启动服务

```
	node app.js
```
