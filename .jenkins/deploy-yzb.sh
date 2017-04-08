#!/bin/bash

echo DEBUG-start
pwd
set
echo DEBUG-end

#before_install:
export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start

#install:
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt-get update -q
sudo apt-get install -q google-chrome-stable libfontconfig1
cnpm install

#script:
npm test && npm run release:yzb-local
