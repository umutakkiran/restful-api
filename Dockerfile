# Resmi Node.js imajını kullan
FROM node:lts-buster

# Uygulama kodunu çalıştırmak için bir çalışma dizini oluştur
WORKDIR /app

# package.json ve package-lock.json'ı kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# Uygulama kodunu kopyala
COPY . .
EXPOSE 4200
EXPOSE 8443

# Uygulamayı çalıştır
CMD ["node", "app.js"]
