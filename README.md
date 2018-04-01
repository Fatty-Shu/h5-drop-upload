# H5拖放文件上传
&emsp;&emsp;前段时间面试过程中，频繁遇到H5异步文件上传的相关问题。遇到一个"通过H5拖放功能实现文件异步上传"的问题，大概知道H5有新增拖拽功能可以接收文件，如何异步上传文件就不知道了。面试结束后，特意去看了相关知识点，了解到**H5拖放+FormDate接口**可以实现异步上传。为了测试文件上传是否成功，后端使用node来接收上传的文件。所以，这会是一个**H5拖放+FormDate接口+nNodeJ.S**实现文件异步上传的完整实例。  
&emsp;&emsp;开始之前，简单介绍一下这几个知识点，贴上详细介绍的链接，有兴趣的同学可以点进去多了解了解。  
####  HTML5 拖放
&emsp;&emsp;拖放（Drag 和 drop）是 HTML5 标准的组成部分。拖放是一种常见的特性，即抓取对象以后拖到另一个位置。抓取的对象可以是页面中元素（需要设置draggable="true"）或者系统文件。监听放置元素的drop事件，通过DataTransfer对象可以获得拖拽事件的状态数据。详情可查阅[MDN的HTML5 拖放 API文档](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API)。  
####  FormDate 接口
&emsp;&emsp;XMLHttpRequest Level 2添加了一个新的接口FormData。利用FormData对象，我们可以通过JavaScript用一些键值对来模拟一系列表单控件，我们还可以使用XMLHttpRequest的send()方法来异步的提交这个"表单"。比起普通的ajax，使用FormData的最大优点就是我们可以异步上传一个二进制文件。详情可查阅[MDN的FormData接口文档](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)。  
#### 后端文件接收
&emsp;&emsp;后端使用Node.jS+Express+express文件中间件Multer实现文件上传。基于 Node.js平台，快速、开放、极简的 web 开发框架。[Multer](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md) 是一个 node.js 中间件，用于处理 multipart/form-data 类型的表单数据，它主要用于上传文件。  
&emsp;&emsp;**以上相关介绍，下面**



