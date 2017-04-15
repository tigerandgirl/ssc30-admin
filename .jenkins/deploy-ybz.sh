#!/bin/bash

# 友报账

echo DEBUG-start
pwd
set
echo DEBUG-end

## functions

# gen config.js
gen_config() {
  scheme="$1"
  host_port="$2"
  path_prefix="$3"
  cat <<EOT > dist/config.js
var G_SCHEME = '$scheme';
var G_HOST_PORT = '$host_port';
var G_PATH_PREFIX = '$path_prefix';
EOT
}

# sync files to remote
sync_files() {
  ssh_ip="$1"
  ssh_port="$2"
  ssh_user="$3"
  rsync_src="$4"
  rsync_dest="$5"
  rsync -arvzh -e "ssh -p $ssh_port" --progress --chmod=a+rwx $rsync_src $ssh_user@$ssh_ip:$rsync_dest
}

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

# 官网
gen_config 'https' 'ybz.yonyoucloud.com' ''
sync_files '10.3.14.233' '22' 'sscweb' 'dist/' \
  '/server/tomcat_ssc/webapps/manaaccount'

# 5088 以后的测试环境
gen_config 'http' '172.20.4.88:5088' ''
sync_files '172.20.4.88' '22' 'root' 'dist/' \
  '/ssc/tomcat_dc_integration_2/webapps/manaaccount/'

# 6088
gen_config 'http' '172.20.4.88:6088' ''
sync_files '172.20.4.88' '22' 'root' 'dist/' \
  '/ssc/tomcat_dc_integration_3/tomcat_dc_integration/webapps/manaaccount'

# 234 鬼知道这是啥环境
gen_config 'http' '10.3.14.234' ''
sync_files '10.3.14.234' '22' 'sscweb' 'dist/' \
  '/server/tomcat_integration/webapps/manaaccount'

date
