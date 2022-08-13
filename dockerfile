# 锁定 node 版本，TODO 怎么根据私有地址，或者国内源来提高初次下载速度
FROM node:14.20.0

LABEL MAINTAINER yy

# RUN 定义命令在哪个目录下发生
WORKDIR /

# 换 apt 源
RUN sed -i s/deb.debian.org/mirrors.ustc.edu.cn/g /etc/apt/sources.list
RUN apt-get clean

RUN apt-get update -y
RUN apt-get upgrade -y

RUN apt-get upgrade -y

RUN apt-get install -y vim
# 方便调试端口占用情况
RUN apt-get install -y lsof
RUN apt-get clean

WORKDIR /home/app/

# 注意，宿主机路径，是以 dockerfile 所在路径为起点
ADD package.json /home/app/

# --no-optional   跳过可选包，有的时候 npm 会让我们选择更新一些旧的包
# --production    避免安装开发依赖项，这个参数【不能加】
# --verbose       打印详细信息
RUN yarn --no-optional --verbose --registry https://registry.npmmirror.com

COPY . /home/app/

RUN yarn build:prd

# 仅仅是定义，和宿主机的 docker -p 11:11 是不一样的
# https://yeasy.gitbook.io/docker_practice/image/dockerfile/expose
EXPOSE 8899

# 容器启动时，自动运行 yarn start
CMD ["yarn", "start"]

