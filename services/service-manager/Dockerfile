FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
    
COPY . .

RUN ./node_modules/.bin/tsc

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/tsconfig.json ./

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/main"]