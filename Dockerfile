FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY .npmrc ./

# Install npm dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN node easypanel-build.js

# Expose the port
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 