#!/bin/bash

echo DEBUG-start
pwd
set
echo DEBUG-end

cnpm install
npm test && npm run release:yzb-local
