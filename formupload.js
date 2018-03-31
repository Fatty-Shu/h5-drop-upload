const express = require('express');
const app = express();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename: (req, file, cb)=>{
        let fileNameArr = file.originalname.split(/\./);
        cb(null, fileNameArr.slice(0,-1).join('.') + '.' + Date.now() + '.' + fileNameArr.splice(-1,1));
    }
});
const upload = multer({ dest: 'uploads/' });
 
app.use(express.static('public'));


app.get('/drop.html', function (req, res) {
   res.sendFile( __dirname + "/" + "drop.html" );
})
 
app.post('/process_post', upload.array('file'), function (req, res,next) {
 
 console.log(req.body)
   // 输出 JSON 格式
 // 没有附带文件
  if (!req.files) {
    res.json({ ok: false });
    return;
  }

  // 输出文件信息
  for(let i=0,len=req.files.length;i<len;i++){
      console.log('====================================================');
      console.log('fieldname: ' + req.files[i].fieldname);
      console.log('originalname: ' + req.files[i].originalname);
      console.log('encoding: ' + req.files[i].encoding);
      console.log('mimetype: ' + req.files[i].mimetype);
      console.log('size: ' + (req.files[i].size / 1024).toFixed(2) + 'KB');
      console.log('destination: ' + req.files[i].destination);
      console.log('filename: ' + req.files[i].filename);
      console.log('path: ' + req.files[i].path);
    }
  res.json(req.files)
  return;
})
 
var server = app.listen(8081, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})