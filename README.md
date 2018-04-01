# H5拖放文件上传
&emsp;&emsp;前段时间面试过程中，频繁遇到H5异步文件上传的相关问题。还遇到过一个"通过H5拖放功能实现文件异步上传"的问题，大概知道H5有新增拖拽功能可以接收文件，如何异步上传文件就母鸡了(摊手)。面试结束后，特意去看了相关知识点，了解到**H5拖放+FormDate接口**可以实现异步上传。为了测试文件上传是否成功，还去看了Node.js如何接收异步文件上传。所以，这会是一个**H5拖放+FormDate接口+Node.js**实现文件异步上传的完整Demo。  
&emsp;&emsp;先简单介绍一下这几个知识点，贴上详细介绍的链接，有兴趣的同学可以点进去多了解一些。  
####  HTML5 拖放
&emsp;&emsp;拖放（Drag 和 drop）是 HTML5 标准的组成部分。拖放是一种常见的特性，即抓取对象以后拖到另一个位置。抓取的对象可以是页面中DOM元素（需要设置draggable="true"）或者系统文件。监听放置元素的drop事件，通过DataTransfer对象可以获得拖拽事件的状态及数据。详情可查阅[MDN的HTML5 拖放 API文档](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API)。  
####  FormDate 接口
&emsp;&emsp;XMLHttpRequest Level 2添加了一个新的接口FormData。利用FormData对象，我们可以通过JavaScript用一些键值对来模拟一系列表单控件，我们还可以使用XMLHttpRequest的send()方法来异步的提交这个"表单"。比起普通的ajax，使用FormData的最大优点就是我们可以异步上传一个二进制文件。详情可查阅[MDN的FormData接口文档](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)。  
#### 后端文件接收&保存
&emsp;&emsp;后端使用Node.js+Express+Multer实现文件上传。[Express](http://www.expressjs.com.cn/)基于 Node.js平台，快速、开放、极简的web开发框架。[Multer](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md) 是一个 node.js 中间件，用于处理 multipart/form-data 类型的表单数据，它主要用于上传文件。  


####  小二，上代码   
  
  
**新建drop.html,插入以下代码**   
  
  
**HTML代码:** 先添加一个放置的div,并且监听ondrop和ondragover事件。
```html
<div class="drop-area"  ondrop="drop_hander(event)" ondragover = "dragover_hander(event)"></div>
```
**样式代码:** 加个边框，设置一下大小。
```css
.drop-area{
	margin:auto;
	width: 500px;
	height: 500px;
	border:1px pink dashed;
}
```
**JavaScript代码:** 监听拖放事件，获取文件，创建XHR实例并发送请求
```JavaScript
/* 拖动到放置区域时 */
function dragover_hander (event) {
	/* 必须同时阻止dragover和drop的默认事件
	   否则会响应浏览器默认行为
	   浏览器能显示的文件会直接显示，例如html文件、图片文件
	   浏览器不能显示的文件会出现文件下载弹窗
	*/
	event.preventDefault(); 
}

/*拖放完成事件*/
function drop_hander (event) {

    event.preventDefault(); //阻止默认事件

    var files = event.dataTransfer.files; //通过dataTransfer对象获取文件对象数组
    var formData = new FormData(); //声明一个FormData实例

    for(var i = 0, len = files.length; i < len; i++) {
    	//使用append方法添加文件到file键
        formData.append('file',  files[i]);
    }

    var request = new XMLHttpRequest(); //创建XHR实例
	request.open('POST', '/process_post'); //初始化请求
	request.send(formData);//发送请求
}
```
**新建formupload.js,写服务端代码**：使用express创建服务，使用multer中间保存文件。 **这里需要安装express和multer依赖包**。这里默认你已经有简单了解Node.js，会使用npm安装依赖包。如果还没接触过，可以看看菜鸟教程的[Node.js 教程](http://www.runoob.com/nodejs/nodejs-tutorial.html),看完前四节就行。
```JavaScript
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
```
到这里代码就结束了，下面是目录结构。完整代码可以查看[项目github地址](https://github.com/Fatty-Shu/h5-drop-upload)。**注意：uploads文件夹一定要存在，否则服务会报错**
```javascript
h5-drop-upload
|- /uploads
|- drop.html
|- formupload
|- package.json
```
打开命令行，在h5-drop-upload目录下执行：
```javascript 
node formupload.js
```
如果没报错，会输出：
```javascript 
应用实例，访问地址为 http://:::8081
```
打开浏览器，输入：127.0.0.1:8081/drap.html。然后拖动文件到粉红色的框中，查看upload文件夹，你上传的文件就会这里（为了避免命名冲突，Multer 会修改上传的文件名）。到了这里还没报错，就表示整个“H5拖放+FormDate接口+Node.js”文件上传的Demo已经跑通了，可以结自己鼓掌了。 

![鼓掌](https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3351915344,1261849770&fm=27&gp=0.jpg)  
  
&emsp;  
#### 结束语
&emsp;&emsp;我们已经简单实现文件异步上传功能，但离实际使用场景还有差距。实际使用中，肯定不能拖放完成就马上上传，至少应该显示一个文件列表，用户可以增删文件，最后确认再开始上传。更进一步，最好可以给个进度条，显示文件上传进度。接下来，让我们继续完善，敬请期待下篇。  

&emsp;&emsp;如果你已经看这里，麻烦顺便点个赞咯。。。。





