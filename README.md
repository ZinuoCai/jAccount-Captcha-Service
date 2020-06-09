# jAccount Captcha Service

> 1. 由于时间问题，该应用的使用模式为前后端分离。谷歌插件 jAccountCaptcha 负责将验证码图片传递给服务器，服务器负责验证码的识别，返回结果。
> 2. 后端服务暂未部署成功，目前只能在本地自己玩耍（主要原因是在登录页面，谷歌插件向后端发送图片时，必须使用 https 协议，部署流程比较麻烦）。
> 3. 前后端分离的模式给用户极大的不安全感（当然，我们的实现中插件只传递了图片信息）。理想情况下，我们应该将后端的服务移植到本地。可行的解决方案是在插件的实现中使用`tensorflow.js` `opencv.js`等前端脚本框架实现本地的识别。
> 4. 该仓库只涉及验证码服务的发布，模型的训练等过程会在<https://github.com/ZinuoCai/jAccount-Captcha>中详细介绍。

## 1. 部署方式

先将仓库 clone 至本地 `git clone https://github.com/ZinuoCai/jAccount-Captcha-Service.git`。

该仓库包含两个文件夹：

- `chrome`：谷歌插件的实现；
- `server`：后端服务的实现。

### 1.1 谷歌插件

参考链接：How to install the unpacked extension in Chrome <https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/>

### 1.2 服务端

服务端的代码主要包含两部分，服务器的搭建和验证码的识别。服务器使用的是 Flask 框架，图形的识别主要用到了 OpenCV 进行图片的预处理，以及 PyTorch 训练的 LeNet 模型进行图像的识别。在本地的测试中，预处理之后的图片，LeNet 进行单独测试时，准确率达到 99+%；对于整张图片的测试，整个框架的准确率达到 94.9%。

首先进入到后端代码的文件夹。

`cd server`

接着安装需要的依赖（为了保证环境的隔离性，可以考虑使用 Anaconda 进行 Python 环境的管理）。

`pip install -r requirements.txt`

最后，启动服务。

`python app.py`

## 2. TODO

- [ ] [近期] 将后端服务部署到云服务器上，使其能够应用到生产环境中。
- [ ] [长期] 使用`tensorflow.js` `opencv.js`等将对验证码的识别操作整合。
- [ ] [问题] 点击验证码刷新后不能及时更正验证码。