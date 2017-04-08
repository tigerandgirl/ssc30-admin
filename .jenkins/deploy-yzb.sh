#!/bin/bash

echo DEBUG-start
pwd
set
echo DEBUG-end

## before_install:
#export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
sudo systemctl start xvfb.service

## install:
cnpm install

## script:
npm test && npm run release:yzb-local
