# 使用官方 Node.js 映像檔作為基礎
FROM node:22-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安裝相依套件
RUN npm ci

# 複製專案所有檔案
COPY . .

# 編譯 Next.js 應用程式
RUN npm run build

# ---- 第二階段 ----
# 使用較輕量的基礎映像檔
FROM node:22-alpine

# 設定工作目錄
WORKDIR /app

# 從 builder 階段複製編譯好的檔案
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 預設使用的埠
EXPOSE 3000

# 啟動應用程式
CMD ["node", "server.js"]