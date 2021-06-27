FROM node:14

WORKDIR /app

# 安装 dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn install

# COPY source code
COPY . ./

# migrate db
RUN yarn prisma generate

# build
RUN yarn build

