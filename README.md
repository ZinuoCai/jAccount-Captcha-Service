# jAccount Captcha Service

> 这是一款能够识别上海交通大学 jAccount 登录的谷歌插件。在识别模型的训练过程中，对于预处理后的单张图片（仅含单个字母）识别准确率达到99+%；对于验证码的识别准确率达到94.9%。
>
> 插件的制作过程主要使用了 **TensorFlow.js**，**OpenCV.js** 来读取和识别验证码。但是，由于 OpenCV.js 的使用结果与 Python 中的 OpenCV可能有所不同，最终实际应用环境的准确率大打折扣。后续工作中会对此加以改进。

## 部署方式

### 1.1 谷歌插件

1. 先将仓库 clone 至本地 `git clone https://github.com/ZinuoCai/jAccount-Captcha-Service.git`。其中 `chrome` 文件夹是插件包含的全部内容。

2. 将插件添加到谷歌浏览器中。

   参考链接：How to install the unpacked extension in Chrome <https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/>

操作成功后，可以看到浏览器的右上角出现上海交通大学的校徽。

<img src="chrome/assets/xiaohui.png" alt="xiaohui" style="width:10%; margin-left: auto; margin-right: auto; display:block" />

### 1.2 模型存储

在插件能够正常工作之前，我们需要手动加载模型和权值。它们都在 `chrome/assets/tfjs_lenet_model` 文件夹中。具体的操作流程如下：

1. 打开 jAccount 的登陆界面，下拉至最下方，然后会看到三个按钮。
2. 选择左面的按钮，添加`model.json`文件。
3. 选择中间的按钮，添加`group1-shard1of1.bin`文件，这是模型的权值。
4. 点击右边的按钮，加载模型，存储到浏览器的 localStorge 中。

操作成功后，会有弹出框提示模型存储成功。以后再次登陆网站时会发现验证码可以自动填充。
