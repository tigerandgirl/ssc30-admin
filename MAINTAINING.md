# 发布和部署

如下内容已经废弃，交给Jenkins来统一进行部署。

## 发布到阿里云

**注意**: 先确认有权限登录阿里云服务器

发布之前先在本地测试一下，运行如下命令

```
npm run build
npm run demo
```

然后在浏览器中测试一下页面显示没有问题，点一点按钮看看是否可以正常提交数据。

升级版本号，比如升级到0.1.4

先修改`package.json`中的版本号

```
git add package.json
git commit -m 'new release'
git tag -a v0.1.4 -m 'new release'
git push --follow-tags
```

运行如下命令，先调用webpack进行打包，然后将结果通过rsync同步到阿里云服务器上。

```
npm run release
PROD_SERVER=10.3.14.240 npm run release # 重新指定后端服务器地址
```

## 发布友报账和友账表

注意：由于使用rsync+ssh，所以请在本地和远程配置好密钥对。

```
git clone https://github.com/yyssc/ssc30-admin.git
cd ssc30-admin
npm install
npm run release:ybz
npm run release:ybz-5088
npm run release:ybz-6088
npm run release:yzb
```
