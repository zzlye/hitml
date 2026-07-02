# syntax=docker/dockerfile:1

# 第一阶段：安装依赖并生成静态产物。
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

# 第二阶段：用 Nginx 托管构建后的静态文件。
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
