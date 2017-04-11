#!/bin/bash

# 友账表

echo DEBUG-start
pwd
set
echo DEBUG-end

## before_install:
export CHROME_BIN=google-chrome
export DISPLAY=:99.0

## install:
cnpm install

## script:
#npm test
npm run build:yzb

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
src=dist/
cd $root_dir

# Bundle and upload
echo "同步本地编译后的数据到友账表服务器 10.3.14.237(localhost)"
cat <<EOT > dist/config.js
var G_SCHEME = 'https';
var G_HOST_PORT = 'fi.yonyoucloud.com';
var G_PATH_PREFIX = /ficloud'';
EOT
rsync -arvzh --delete --progress --chmod=a+rwx $src /data/ficloud/uiresources/manaaccount/



date
