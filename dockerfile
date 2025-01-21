###backend/dockerfile
# 使用 node 基礎映像檔
FROM node:22.12.0

# 設定工作目錄
WORKDIR /app

# 複製 package.json 並安裝相依套件
COPY package.json /app/
RUN npm install
# 複製專案文件
COPY . /app/

EXPOSE 8000

# 開啟 應用程式
CMD ["npm", "run","start"]


