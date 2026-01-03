# Playwright-enabled Dockerfile for Railway deployment
# Base image with Playwright pre-installed (includes Chromium)
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Install Playwright browsers (just chromium for smaller image)
RUN npx playwright install chromium

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start command (runs migrations then starts app)
CMD npx prisma migrate deploy && npm start
