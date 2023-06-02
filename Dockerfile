FROM node:20

COPY src/ ./src
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm ci

RUN npm run build

CMD ["npm", "run", "start"]


