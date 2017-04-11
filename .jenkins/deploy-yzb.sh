#!/bin/bash

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
npm run release:yzb-local
