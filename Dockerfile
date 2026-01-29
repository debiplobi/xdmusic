FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app
RUN apk add --no-cache libc6-compat

RUN npm install -g wrangler

COPY . .

RUN npm install
RUN npm run build

CMD ["wrangler", "deploy"]
