# Playwright-enabled Dockerfile for Railway deployment
FROM mcr.microsoft.com/playwright:v1.48.0-noble

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (need dev deps for build)
RUN npm ci

# Install Playwright Chromium browser
RUN npx playwright install chromium --with-deps

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start command (runs migrations then starts app)
CMD npx prisma migrate deploy && npm start
