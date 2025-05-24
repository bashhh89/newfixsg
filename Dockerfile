FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Set up NPM for legacy compatibility
RUN echo "legacy-peer-deps=true" > .npmrc && \
    echo "node-linker=hoisted" >> .npmrc

# Install dependencies with npm
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Set the port
ENV PORT=3008
EXPOSE 3008

# Start the application
CMD ["npm", "start"] 