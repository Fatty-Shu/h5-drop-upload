#H5拖放异步文件上传之二——监听上传进度
&emsp;&emsp;上一篇[《H5拖放+FormData接口+NodeJS，完整异步文件上传（一）》](https://segmentfault.com/a/1190000014124076)，我们走通了拖放文件上传的整个流程，但离实际使用场景还有差距。这篇，我们来添加几个实际使用场景必要的功能，向实际使用再走一步。   
### 添加功能
1. 显示待上传文件列表;
2. 支持移除待上传文件;
3. 使用upload.onprogress显示上传进度;
4. 支持中断上传;

### upload.progress
> XMLHttpRequest.upload方法返回一个 XMLHttpRequestUpload对象，用来表示上传的进度。这个对象是不透明的，但是作为一个XMLHttpRequestEventTarget，可以通过对其绑定事件来追踪它的进度。onprogres监听数据传输进行中(通过监听这个事件，可获得上传进度)。[摘自MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/upload)  

### 实现思路
&emsp;&emsp;拖放文件到上传区域时，将文件保存在一个文件数组中，添加并显示文件相关信息和移除按钮，点击移除按钮删除文件数组中对应的文件元素，点击上传按钮，遍历文件数组，开始上传待上传文件，此时点击移除按钮则中止文件上传。

### 代码
```style
//相关样式
.drop-area{
  margin:auto;
  width: 500px;
  height: 500px;
  border:1px pink dashed;
}
.close-btn{
  cursor: pointer;
}
.close-btn:after{
  float: right;
  content: 'X';
  color: red;
}
#fileList{
  width: 95%;
}
.process-bar{
    position: relative;
    margin: 0 10px 0 10px;
    width: 198px;
    height: 18px;
    display: none;
    text-align: center;
    line-height: 20px;
    color: #6dbfff;
    border-radius: 3px;
    border: 1px solid #1483d8;    
    background: #fff;
}
.success .process-bar,
.uploading .process-bar{
  display: inline-block;
}
.process-bar .process-text{
  position: relative;
  z-index: 1;
}
.process-bar .process-rate{
    position: absolute;
  width: 0;
  height: 100%;
    left: 0;
    top: 0;
    border-radius: 3px;
  background: #1483d8;
}
.file-list .success .process-text,
.file-list .success .close-btn:after,
.file-list .error .process-text,
.file-list .error .close-btn:after{
  display: none;
}
 .success .process-bar :after,
.error .process-bar :after{
  content:'success';
  position: absolute;    
  margin: auto;
  left: 0;
  right: 0;
  z-index: 2;
}
.error .process-bar:after{
  content: "error";
  color: red;
}
```
```html
<!--HTML-->
<div class="drop-area"  ondrop="drop_hander(event)" ondragover = "dragover_hander(event)"></div><!--监听拖放DOM-->
<div id="fileList" class="file-list"></div><!--显示待上传文件列表-->
<button id="submit">上传</button><!--上传按钮-->
```
```JavaScript
//Javascript代码
let filesSet = []; //文件保存数组
let fileList = document.getElementById('fileList'); //获取显示文件列表DOM

/**
 * 创建一个新的空白的文档片段frag
 * 用于附加多个待上传文件的DOM,可减小回流
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createDocumentFragment
 */
let frag = document.createDocumentFragment();
let barDom = createProccessBar(); //创建进度条DOM
let submit = document.getElementById("submit") //获取提交按钮


/* 拖动到放置区域时 */
function dragover_hander (event) {
  /* 必须同时阻止dragover和drop的默认事件
     否则会响应浏览器默认行为
     浏览器器能显示的文件会直接显示，例如html文件、图片文件
     浏览器器不能显示的文件会出现文件下载弹窗
  */
  event.preventDefault(); 
}

/*拖放完成事件*/
function drop_hander (event) {

    event.preventDefault(); //阻止默认事件

    var files = event.dataTransfer.files; //通过dataTransfer对象获取文件对象数组

    for(let file of files) { //遍历文件对象数组

       //创建文件信息显示DOM,并保存在file对象的element属性中，用于后续操作
       file.element = createFileDom(file, filesSet.length)
       //复制进度条DOM,并保存在file对象的processBar属性中，用于后续操作
       file.processBar = filesSet.length?barDom.cloneNode(true):barDom;
       //将进度条添加至文件信息显示DOM中
       file.element.appendChild(file.processBar);
       //file文件对象添加到文件保存数组
       filesSet.push(file);
       //创建文件信息显示DOM添加至文档片段frag
       frag.appendChild(file.element);
    }

    //将文件列表添加至显示文件列表的div
    fileList.appendChild(frag)
}


/**
 * 创建文件信息显示DOM
 * file  文件对象，用于获取文件信息
 * index 文件对象在数组中的索引，用于删除
 */
function createFileDom (file, index) {
  let p = document.createElement('p'); 
  //file.name属性可以获得文件名称
  //有兴趣的童鞋，可以使用for...in循环查看一下file对象的其它属性值
  let text = document.createTextNode(file.name); 
  let span = document.createElement("span");
  span.setAttribute('index', index); //索引添加至按钮的index属性
  span.className = 'close-btn'; 
  p.appendChild(text);
  p.appendChild(span);

  return p; //返回文件信息显示DOM
}
/**
 * 创建进度条DOM,
 * 进度条DOM结构固定，可使用clone(true)进行复制
 * @return {[type]} [description]
 */
function createProccessBar() {
  let bar =  document.createElement("span");
  let rate = document.createElement("span");
  let text = document.createElement("span");
  bar.className = "process-bar";
  rate.className = "process-rate";
  text.className = "process-text";
  text.innerText="0%";
  bar.appendChild(text);
  bar.appendChild(rate);
  return bar; 
} 

//通过事件代理，监听移除或中止上传
fileList.addEventListener('click', (evt)=>{
  let index = evt.target.getAttribute('index'); //获得index属性值
  if (index) { //存在index属性值，表示点击了删除按钮

    if (filesSet[index].unloading && filesSet[index].req) { //文件已经上传中
      filesSet[index].req.abort(); //中止上传
      filesSet[index].unloading = false;  //将上传中的状态设置为false 
    } else { //未开始上传
      filesSet[index].element.remove(); //移除DOM
      filesSet[index].element = null; //释放对DOM的引用
      filesSet[index].processBar = null;//释放对DOM的引用
      delete filesSet[index];//删除文件数组中对应的元素 
    }

  }
})

submit.addEventListener('click',function(){// 为上传按钮绑定事件

  //这里使用for...in循环,正好可以避免对数组稀疏元素的遍历
  for(let key in filesSet){
    //如果正在上传中或已经上传完成，不再上传
    if (filesSet[key].unloading || filesSet[key].uploaded) continue; 
    filesSet[key].unloading = true; //标记开始上传

    //创建一个文件上传的Promise，并设置成功及失败的回调
    initUpload(filesSet[key]).then(file => {
      //上传成功
      file.element.className = "success"; //UI显示成功信息
      file.uploaded = true; //标记上传成功
    }).catch((file, err) => {
      file.element.className = "error"; //UI显示失败信息
      //取消开始上传标记，点击上传按钮将尝试再次上传
      filesSet[key].unloading = false; 
    })
  }
})

/**
 * 返回一个文件上传的Promise实例
 * @param  {[type]} file 要上传的文件
 */
function initUpload(file){

  return new Promise((res, rej) => {
    let formData = new FormData();//声明一个FormData实例
    let req = new XMLHttpRequest();//创建XHR实例
    let reta = file.processBar.querySelector('.process-rate');//获得进度条DOM
    let text = file.processBar.querySelector('.process-text');//获得进度文本DOM
    let pre;//保存上传百分比
    //监听数据传输进行中
    req.upload.onprogress =function(data){ 
      pre = (data.loaded/data.total*100).toFixed(2);//计算百分比
      reta.style.width = pre +'%';//修改进度条
      text.innerText = pre +'%' ;//修改进度条文本
    }
    //监听请求完成
    req.onreadystatechange = function () {
      if (req.readyState !==4 ) return ; 
      if (req.status === 200 ){
        //完成，执行成功回调
        res(file, req)
      } else {
        //失败，执行失败回调
        rej(file, req)
      }
    }
    formData.append('file',file); //使用append方法添加文件到file键
    req.open('POST', '/process_post'); //初始化请求
    req.send(formData); //发送请求
    file.req = req; //保存req对象，用于中止请求
    //形如显示上传进度
    file.element.className = "uploading"        
  })
}
```
&emsp;&emsp;到这里代码就结束了，完整代码可以查看[Github](https://github.com/Fatty-Shu/h5-drop-upload)。因为是本地上传，在测试的时候可以使用大一些的文件，或者限制一下上传。  

### 结束语
&emsp;&emsp;这些新的API，使得文件拖放上传变得简单起来。可惜低版本的IE并不支持，听说低版本的IE可以使用Falsh来进行文件上传，具体是如何实现的，要不我们下篇再来探讨一下。  
&emsp;&emsp;  
&emsp;&emsp;  



# H5拖放文件上传
&emsp;&emsp;前段时间面试过程中，频繁遇到H5异步文件上传的相关问题。还遇到过一个"通过H5拖放功能实现文件异步上传"的问题，大概知道H5有新增拖拽功能可以接收文件，如何异步上传文件就母鸡了(摊手)。面试结束后，特意去看了相关知识点，了解到**H5拖放+FormData接口**可以实现异步上传。为了测试文件上传是否成功，还去看了Node.js如何接收异步文件上传。所以，这会是一个**H5拖放+FormData接口+Node.js**实现文件异步上传的完整Demo。  
&emsp;&emsp;先简单介绍一下这几个知识点，贴上详细介绍的链接，有兴趣的同学可以点进去多了解一些。  
####  HTML5 拖放
&emsp;&emsp;拖放（Drag 和 drop）是 HTML5 标准的组成部分。拖放是一种常见的特性，即抓取对象以后拖到另一个位置。抓取的对象可以是页面中DOM元素（需要设置draggable="true"）或者系统文件。监听放置元素的drop事件，通过DataTransfer对象可以获得拖拽事件的状态及数据。详情可查阅[MDN的HTML5 拖放 API文档](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API)。  
####  FormData 接口
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
打开浏览器，输入：127.0.0.1:8081/drap.html。然后拖动文件到粉红色的框中，查看upload文件夹，你上传的文件就会这里（为了避免命名冲突，Multer 会修改上传的文件名）。到了这里还没报错，就表示整个“H5拖放+FormData接口+Node.js”文件上传的Demo已经跑通了，可以结自己鼓掌了。 

![鼓掌](https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3351915344,1261849770&fm=27&gp=0.jpg)  
  
&emsp;  
#### 结束语
&emsp;&emsp;我们已经简单实现文件异步上传功能，但离实际使用场景还有差距。实际使用中，肯定不能拖放完成就马上上传，至少应该显示一个文件列表，用户可以增删文件，最后确认再开始上传。更进一步，最好可以给个进度条，显示文件上传进度。接下来，让我们继续完善，敬请期待下篇。  

&emsp;&emsp;如果你已经看这里，麻烦顺便点个赞咯。。。。





