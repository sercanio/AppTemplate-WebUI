# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create entrypoint script directly in Dockerfile
RUN cat > /docker-entrypoint.sh << 'EOF'
#!/bin/sh

# Default API URL if not provided
VITE_API_URL=${VITE_API_URL:-"http://localhost:5070/api/v1"}

echo "Configuring app with API URL: $VITE_API_URL"

# Debug: Show what URLs are currently in the built files
echo "Current API URLs found in JS files:"
find /usr/share/nginx/html -name "*.js" -type f -exec grep -l "localhost.*api/v1" {} \; | head -3 | while read file; do
    echo "File: $file"
    grep -o "http://localhost:[0-9]*/api/v1" "$file" | head -3
done

# Find and replace common API URL patterns
# Replace both 5070 and 5000 ports to handle any build variations
find /usr/share/nginx/html -name "*.js" -type f -exec sed -i \
    -e "s|http://localhost:5070/api/v1|$VITE_API_URL|g" \
    -e "s|http://localhost:5000/api/v1|$VITE_API_URL|g" {} \;

# Also replace in any potential config files
find /usr/share/nginx/html -name "*.json" -type f -exec sed -i \
    -e "s|http://localhost:5070/api/v1|$VITE_API_URL|g" \
    -e "s|http://localhost:5000/api/v1|$VITE_API_URL|g" {} \;

echo "Environment variable substitution completed"

# Debug: Verify the replacement worked
echo "API URLs after replacement:"
find /usr/share/nginx/html -name "*.js" -type f -exec grep -l "localhost.*api/v1" {} \; | head -2 | while read file; do
    echo "File: $file"
    grep -o "http://[^\"]*api/v1" "$file" | head -3
done

# Start nginx
exec "$@"
EOF

# Make the script executable
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script to handle environment variables
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]