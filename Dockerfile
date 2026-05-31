# Dockerfile for deploying QuickApply.AI to Google Cloud Run / other container platforms
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
