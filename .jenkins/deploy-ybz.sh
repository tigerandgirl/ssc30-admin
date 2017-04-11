#!/bin/bash

# 友报账

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
npm run build:ybz

# Change to source root dir
utils_dir=`dirname $(readlink -f $0)`
root_dir=`dirname $utils_dir`
src=dist/
cd $root_dir

#8080
ip=10.3.14.233
port=22
user=sscweb
src=dist/
dest=/server/tomcat_ssc/webapps/manaaccount
rsync -arvzh -e "ssh -p $port" --progress --chmod=a+rwx $src $user@$ip:$dest

#5088 以后的测试环境
ip=172.20.4.88
port=22
user=root
src=dist/
dest=/ssc/tomcat_dc_integration_2/webapps/manaaccount/
rsync -arvzh -e "ssh -p $port" --progress --chmod=a+rwx $src $user@$ip:$dest

#6088
ip=172.20.4.88
port=22
user=root
src=dist/
dest=/ssc/tomcat_dc_integration_3/tomcat_dc_integration/webapps/manaaccount
rsync -arvzh -e "ssh -p $port" --progress --chmod=a+rwx $src $user@$ip:$dest

date
