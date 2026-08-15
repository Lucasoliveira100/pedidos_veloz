# Build multi-stage - estágio 1 resolve dependências, estágio 2 roda a app
# enxuta em imagem alpine, sem ferramentas de build sobrando na imagem final.
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
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://localhost:8080/healthz || exit 1
CMD ["node", "src/index.js"]
