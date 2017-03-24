#!/bin/bash

user=root
ip=10.3.14.237
port=22

CLUSTER_NODE237=10.3.14.237
TESTING_SERVER=172.20.4.88

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Bundle and upload
echo "同步本地编译后的数据到集群中的一个节点 10.3.14.237"
rsync -arvzh -e "ssh -p $port" --progress --chmod=777 dist/ $user@$CLUSTER_NODE237:/data/ficloud/uiresources/manaaccount/
echo "同步本地编译后的数据到友报账联调服务器 172.20.4.88"
rsync -arvzh -e "ssh -p $port" --progress --chmod=777 dist/ $user@$TESTING_SERVER:/ssc/tomcat_dc_integration/webapps/manaaccount/
