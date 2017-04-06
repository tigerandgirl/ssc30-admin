#!/bin/bash

# 友报账

ip=172.20.4.88
port=22
user=root
src=dist/
dest=/ssc/tomcat_dc_integration_2/webapps/manaaccount/

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Bundle and upload

echo "同步本地编译后的数据到友报账联调服务器 172.20.4.88:5088"
rsync -arvzh -e "ssh -p $port" --progress --chmod=a+rwx $src $user@$ip:$dest

date
