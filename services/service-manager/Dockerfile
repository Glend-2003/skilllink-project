FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && \
    npm install @nestjs/config @nestjs/passport passport passport-jwt cloudinary streamifier @types/multer --save
    
COPY . .

RUN ./node_modules/.bin/tsc

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]