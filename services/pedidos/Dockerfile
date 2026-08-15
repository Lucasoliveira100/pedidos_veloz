FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS runtime
RUN addgroup -S veloz && adduser -S veloz -G veloz
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER veloz
EXPOSE 8081
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://localhost:8081/healthz || exit 1
CMD ["node", "src/index.js"]
