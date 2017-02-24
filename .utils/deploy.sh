#!/bin/bash

user=root
ip=10.3.14.237
port=22

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Building
npm run build

# Bundle and upload
rsync -arvzh -e "ssh -p $port" --progress dist/ $user@$ip:/data/ficloud/uiresources/manaaccount/

# 有些设计图，不再产品范围内，在演示范围内
rsync -avzh -e "ssh -p 22" --progress client/screenshot_20170224_011.jpg \
  root@10.3.14.237:/data/ficloud/uiresources/manaaccount/
