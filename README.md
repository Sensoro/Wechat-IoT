#开发者指南

##工作原理

我们的开发者套件主要由 3 部分组成：SMART TAG + SENSORO IOT 体验板 + 智能硬件开发板。同时 SENSORO 微信公众号iot页面中会提供对开发者套件的操作界面，包括绑定设备、连接设备、断开设备、语音输入操作指令。

####总体流程
	
	微信客户端 -> SENSORO 公众号 -> IOT 页面 -> 绑定并连接设备（自动连接）
	-> 语音输入 -> 蓝牙发送转码命令 -> SMART TAG 接受命令 -> SMART TAG 串口输出命令 
	-> 智能硬件开发板 解析命令 -> 智能硬件开发板 控制 IOT 体验板 -> RGB灯或者电机响应命令

####一、IOT 页面
主要功能：与 SMART TAG 通讯，完成绑定、连接等操作。支持语音向 SMART TAG 发送命令，如语音输入“蓝色”，iot页面将命令进行GB2312转码为“C0B6C9AB”，然后传递给 SMART TAG。

####二、SMART TAG 
主要功能：接受微信客户端的命令，通过串口经过 IOT 体验板传递给 智能硬件开发板。所有的命令均使用GB2312编码，我们将 Arduino D6、D7 两个io口模拟成的虚拟串口来接受 SMART TAG 传递的命令。

####三、智能硬件开发板
主要功能：通过 D6、D7 模拟的虚拟串口接收 SMART TAG 的指令。如收到“蓝色”对于编码命令“C0B6C9AB”，智能硬件开发板 将通过控制自己的io口来控制 SENSORO IOT 体验板。

####四、SENSORO IOT 体验板
主要功能：集成RGB灯、电机、温度湿度传感器、红外传感器等元件，提供 SMART TAG 插槽并将其串口与 智能硬件开发板 接口对接。

##智能硬件开发板接口对应表
开发者可以为 SMART TAG KIT 中的 智能硬件开发板 编写程序，来实现功能的自定义。     
下面列出已被占用的 智能硬件开发板 接口：

####虚拟串口，与 SMART TAG 进行串口通讯
	RX ：D6    
	TX ：D7
####RGB灯
	SCL ：A5    
	SDA ：A4
####电机
	ANODE ： D5    
	CATHODE ：D4
####温湿度传感器
	PIN ：D3
	

##体验步骤
1. 用 USB 线为 智能硬件开发板 板子供电
2. 微信扫描随机附赠卡片上的二维码绑定设备
3. 打开 SENSORO 微信公众号，进入IOT页面
4. 当设备连接成功后，语音输入命令
5. 开发者套件响应命令

#####已支持的命令：
蓝色、红色、绿色、变、闪、熄灭。     
转、加速、减速、停。
温度、湿度。

  
##开始动手
####相关资源
开发者套件中的 智能硬件开发板 兼容 Arduino。
 * Arduino 官网 http://arduino.cc/
 * Arduino 中文社区 http://www.arduino.cn/
 * Arduino IDE链接 http://arduino.cc/en/Main/Software

####如何开发
1. 打开 IDE
2. 打开 DEMO 工程 wechat\wechat_hardware\wechat_hardware.ino
3. 导入库：项目-->导入库-->添加库-->添加wechat\lib下的各个压缩包。
4. 添加指令：查找需要添加的中文指令的GB2312码，添加到宏定义处。  
（提示：直接用微信公众号说指令，页面上会有相应的GB2312码）
		
		//Cmd, which is the GB2312 codes of the Chinese character
		#define GB_XIMIE      "CFA8C3F0"
		#define GB_LANSE      "C0B6C9AB"
		...
5. 添加相应的指令解析执行代码
			
		...
	    if(!memcmp(cmd.data,GB_XIMIE,cmd.len)){
	      flag_rgb_blink=false;
	      flag_rgb_rainbow=false;
	      rgbLed.setColorRGB(0,0,0);
	    }
	    else if(!memcmp(cmd.data,GB_LANSE,cmd.len)){
	      flag_rgb_blink=false;
	      flag_rgb_rainbow=false;
	      rgbLed.setColorRGB(0,0,255);
	    }
	    ...
6. 验证、上传代码至 智能硬件开发板 
7. 测试

##重要提示
	扩展板上的按键不要按！
原因：由于 智能硬件开发板 只有一个串口，向板子里下载程序要用此串口。微信硬件蓝牙模块也要用串口和智能硬件开发板通信，假如模块也使用此串口的话，就会出现一个问题，当模块插在板子上时，就无法下载程序。然后咱就使用软串口SoftSerial与模块通信，由于扩展板是采购的，相关硬件限制，只好把SoftSerial的两根线接到了按键上。按按键将会影响微信与智能硬件开发板板的通信




##开发者支持
官网：http://www.sensoro.com/zh/iot

中国，北京（总部）      
邮箱：beijing@sensoro.com      
地址：北京市朝阳区望京SOHO T1号楼 B座 2807

开发者 QQ 群 ：361891407     
400电话 ：400 - 686 - 3180 








