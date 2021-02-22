#!/usr/bin/env sh 
# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'
git remote add origin https://github.com/123456wjw/123456wjw.github.io.git

# 如果你想要部署到 https://USERNAME.github.io
git push -f origin master

cd -
