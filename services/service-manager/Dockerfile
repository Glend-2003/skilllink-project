# Usa una imagen ligera de Node
FROM node:18-alpine

# Crea la carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Compila el código (NestJS)
RUN npm run build

# Expone el puerto (el mismo que en tu main.ts)
EXPOSE 3004

# Comando para iniciar
CMD ["npm", "run", "start:prod"]