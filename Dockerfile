FROM node:20-bookworm

WORKDIR /app

RUN npm install -g wrangler

COPY . .

RUN npm ci
RUN npm run build

CMD ["wrangler", "deploy"]
