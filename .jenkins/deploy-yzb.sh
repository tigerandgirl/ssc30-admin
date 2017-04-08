#!/bin/bash
export PATH=$PATH:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/opt/erlang/bin:/home/sscweb/.local/bin:/home/sscweb/bin:/home/sscweb/node-v6.10.0/bin:/home/sscweb/node-v6.10.0/lib/node_modules

echo DEBUG-start
pwd
set
echo DEBUG-end

[ -d ssc30-admin/.git ] || git clone https://github.com/yyssc/ssc30-admin.git
cd ssc30-admin
git pull

cnpm install
npm run release:yzb
