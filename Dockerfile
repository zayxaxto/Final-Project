# Stage 1: Build 
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve 
FROM node:18-alpine

WORKDIR /app

# Install 'serve', a basic Node.js static file server
RUN npm install -g serve

# Copy only the compiled build files
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Serve the application over HTTP (University server will forward HTTPS to this port)
CMD ["serve", "-s", "build", "-l", "3000"]
