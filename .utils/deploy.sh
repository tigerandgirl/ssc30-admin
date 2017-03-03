#!/bin/bash

user=root
ip=10.3.14.237
port=22

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
cd $root_dir

# Bundle and upload
rsync -arvzh -e "ssh -p $port" --progress dist/ $user@$ip:/data/ficloud/uiresources/manaaccount/
