FROM node:22-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Expose API port
EXPOSE 5001

# Run directly with Node.js - no compilation, no build step
CMD ["node", "src/server.js"]
