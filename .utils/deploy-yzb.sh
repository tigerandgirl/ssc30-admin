#!/bin/bash

# 友账表

user=root
ip=10.3.14.237
port=22

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Bundle and upload
echo "同步本地编译后的数据到集群中的一个节点 10.3.14.237"
rsync -arvzh -e "ssh -p $port" --progress --chmod=a+rwx dist/ $user@$ip:/data/ficloud/uiresources/manaaccount/

date
