FROM node:20-alpine AS base
WORKDIR /app

# Install deps separately for better cache
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy source
COPY src ./src

EXPOSE 3000
CMD ["node", "src/index.js"]
