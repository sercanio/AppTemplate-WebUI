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