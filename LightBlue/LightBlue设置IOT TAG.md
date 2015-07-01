DEVICE_ID的格式默认设置为DEVICE_TYPE+MAC地址

0xDEAEFFF1-...  MAC地址设置          HEX格式写入   12位
0xDEAEFFF2-...  DEVICE_TYPE设置     UTF-8格式写入 15位  公众号标识
0xDEAEFFF3-...  保留
0xDEAEFFF4-...  AESkey设置          HEX格式写入   32位
0xDEAEFFF5-...  保留
0xDEAEFFF6-...  读取DEVICE_TYPE值

MAC地址可以在ADVERTISEMENT DATA中查询

