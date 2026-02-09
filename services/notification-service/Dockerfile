FROM node:18-alpine

# Instalamos utilidades de red por si necesitamos debuggear luego
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3006

# Apuntamos al archivo de entrada que definimos en el plan anterior
CMD ["node", "src/app.js"]