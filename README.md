#开发者指南

##工作原理

我们的开发者套件主要由 3 部分组成：SMART TAG + Arduino + SENSORO IOT 体验板。同时 SENSORO 微信公众号iot页面中会提供对开发者套件的操作界面，包括绑定设备、连接设备、断开设备、语音输入操作指令。

####总体流程
	
	微信客户端 -> SENSORO 公众号 -> IOT 页面 -> 绑定并连接设备（自动连接）
	-> 语音输入 -> 蓝牙发送转码命令 -> SMART TAG 接受命令 -> SMART TAG 串口输出命令 
	-> Arduino 解析命令 -> Arduino 控制 IOT 体验板 -> RGB灯或者电机响应命令

####一、IOT 页面
主要功能：与 SMART TAG 通讯，完成绑定、连接等操作。支持语音向 SMART TAG 发送命令，如语音输入“蓝色”，iot页面将命令进行GB2312转码为“C0B6C9AB”，然后传递给 SMART TAG。

####二、SMART TAG 
主要功能：接受微信客户端的命令，通过串口经过 IOT 体验板传递给 Arduino。所有的命令均使用GB2312编码，我们将 Arudino D6、D7 两个io口模拟成的虚拟串口来接受 SMART TAG 传递的命令。

####三、Arduino
主要功能：通过 D6、D7 模拟的虚拟串口接收 SMART TAG 的指令。如收到“蓝色”对于编码命令“C0B6C9AB”，Arduino 将通过控制自己的io口来控制 SENSORO IOT 体验板。

####四、SENSORO IOT 体验板
主要功能：集成RGB灯、电机、温度湿度传感器、红外传感器等元件，提供 SMART TAG 插槽并将其串口与 Arduino 接口对接。

##Arduino接口对应表
开发者可以为 SMART TAG KIT 中的 Arduino 编写程序，来实现功能的自定义。     
下面列出已被占用的 Arduino 接口：

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


##开发者支持
官网：http://www.sensoro.com/zh/iot

中国，北京（总部）      
邮箱：beijing@sensoro.com      
地址：北京市朝阳区望京SOHO T1号楼 B座 2807

开发者 QQ 群 ：361891407     
400电话 ：400 - 685 - 0801 








