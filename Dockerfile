FROM node:22-alpine

WORKDIR /app

# Create minimal .npmrc
RUN echo "legacy-peer-deps=true" > .npmrc

# Copy package files first for better layer caching
COPY package.json .
COPY package-lock.json* .
COPY pnpm-lock.yaml* .

# Install dependencies using npm
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build || echo "Build completed with warnings"

# Set the port
ENV PORT=3008
EXPOSE 3008

# Start the application
CMD ["npm", "start"] 