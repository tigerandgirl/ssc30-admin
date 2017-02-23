#!/bin/bash

user=root
ip=101.200.74.182
port=9999

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Building
#npm run build

# Bundle and upload
target="/var/www/ssc30-admin/"
rsync -arvzh -e "ssh -p $port" --progress \
  --exclude "node_modules" --exclude ".git" \
  . $user@$ip:$target
