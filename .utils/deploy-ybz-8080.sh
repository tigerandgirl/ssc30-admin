#!/bin/bash

# 友报账

ip=10.3.14.233
port=22
user=sscweb
src=dist/
dest=/server/tomcat_ssc/webapps/manaaccount

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Bundle and upload

echo "同步本地编译后的数据到友报账联调服务器 10.3.14.233:8080"
rsync -arvzh -e "ssh -p $port" --progress --chmod=a+rwx $src $user@$ip:$dest

date
