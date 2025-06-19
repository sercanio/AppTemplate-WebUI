# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - Use Vite preview instead of nginx
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose port 4173 (Vite preview default)
EXPOSE 4173

# Use Vite preview to serve the built application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
CMD ["nginx", "-g", "daemon off;"]
cat > /usr/share/nginx/html/env-config.js << ENVEOF
window.ENV = {
  VITE_API_URL: "${VITE_API_URL}",
  VITE_APP_NAME: "${VITE_APP_NAME}"
};
ENVEOF

echo "Environment configuration created:"
cat /usr/share/nginx/html/env-config.js

# Execute the main command
exec "$@"
EOF

RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
