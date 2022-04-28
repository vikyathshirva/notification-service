FROM  node:14-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip make g++



COPY package.json package-lock.json ./
RUN npm install -g npm@8.8.0 

COPY . .
RUN npm install

CMD ["npm","start"]