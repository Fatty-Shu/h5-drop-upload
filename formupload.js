const express = require('express'); //引入express模块
const app = express(); //创建一个express应用
const multer = require('multer'); // 引入multer模块

/*
 新建一个multer中间件，设置文件保存路径
 路径必须存在，否则会报错
*/
const upload = multer({ dest: 'uploads/' }); 

/* 请求/drop.html，返回文件 */
app.get('/drop.html', function (req, res) {
   res.sendFile( __dirname + "/" + "drop.html" );
})

/* 
创建提交接口
使用中间件处理
upload.array('file')表示上传一个名为file文件数组
 */
app.post('/process_post', upload.array('file'), function (req, res,next) {
 
  if (!req.files) { // 末上传文件的返回
    res.json({ ok: false });
    return;
  }
  //有上传文件,返回文件列表
  res.json(req.files)
  return;
})

//启动服务，监听8081端口
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})