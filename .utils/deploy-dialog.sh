#!/bin/bash

# Dialog script from http://askubuntu.com/a/666179

# Default SSH config
port=22
user=root

# Server IP

# 友报账
YBZ_IP=172.20.4.88
# 友账表
YZB_IP=10.3.14.237

# Dialog config
HEIGHT=20
WIDTH=50
CHOICE_HEIGHT=10
BACKTITLE="部署到指定服务器"
TITLE="服务器列表"
MENU="请在下面列表中选择需要部署的服务器:"
OPTIONS=(1 "友报账 172.20.4.88:8088"
         2 "友账表 59.110.123.20"
         3 "友报账 172.20.4.88:5088"
         4 "友报账 172.20.4.88:6088"
         5 "debugger"
)
CHOICE=$(dialog --clear \
                --backtitle "$BACKTITLE" \
                --title "$TITLE" \
                --menu "$MENU" \
                $HEIGHT $WIDTH $CHOICE_HEIGHT \
                "${OPTIONS[@]}" \
                2>&1 >/dev/tty)

clear
case $CHOICE in
        1)
            # 友报账 8088
            .utils/deploy-ybz.sh
            ;;
        2)
            # 友账表
            .utils/deploy-yzb.sh
            ;;
        3)
            # 友报账5088
            .utils/deploy-ybz-5088.sh
            ;;
        4)
            # 友报账6088
            .utils/deploy-ybz-6088.sh
            ;;
        5)
            # debugger;
            pwd
            ;;
esac

if [ -z $ip ]; then
  echo "没有选择"
  exit 0
fi
