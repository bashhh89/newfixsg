FROM node:22-alpine

WORKDIR /app

# Create minimal .npmrc if not present
RUN echo "legacy-peer-deps=true" > .npmrc

# Copy the entire application (more resilient than individual files)
COPY . .

# Install npm dependencies
RUN npm install --legacy-peer-deps

# Build the application
RUN node easypanel-build.js || npm run build

# Expose the port
ENV PORT=3008
EXPOSE 3008

# Start the application
CMD ["npm", "start"] 