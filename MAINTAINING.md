# 发布和部署

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

## 发布友报账

```
npm run release:ybz
```

发布到友报账服务器的其他端口（因为该服务器启动了多个tomcat，比如端口6088）

```
PROD_SERVER=172.20.4.88:6088 npm run build:ybz # 重新指定后端服务器地址和端口
.utils/deploy-dialog.sh # 选择目标服务器和地址
```

## 发布友账表

```
npm run release:yzb
```
