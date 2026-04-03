# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copy the built dynamic static files from stage 1 over to Caddy's default folder
COPY --from=build /app/build /srv/coderaffy

# Copy our custom configuration file for routing
COPY Caddyfile /etc/caddy/Caddyfile

# Explicitly expose port 80
EXPOSE 80
