FROM node:alpine AS builder
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
# create /app/build 
FROM node:alpine
WORKDIR '/app'
COPY --from=builder /app/.next /usr/share/nginx/html
CMD ["npm", "run", "build"]