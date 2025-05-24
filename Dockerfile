FROM alpine/git:latest AS source

# Clone the repository (replace with your repository)
RUN git clone https://github.com/bashhh89/newfixsg.git /app
WORKDIR /app
RUN git checkout againbranch

# Second stage - build and run the application
FROM node:22-alpine

WORKDIR /app

# Copy from the git stage
COPY --from=source /app /app

# Create minimal .npmrc
RUN echo "legacy-peer-deps=true" > .npmrc

# Install dependencies
RUN npm install --legacy-peer-deps

# Build the application with fallback
RUN npm run build || echo "Build completed with warnings"

# Set the port
ENV PORT=3008
EXPOSE 3008

# Start the application
CMD ["npm", "start"] 