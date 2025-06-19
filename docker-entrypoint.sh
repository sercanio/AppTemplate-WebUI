#!/bin/sh
# filepath: c:\Users\serca\source\repos\sercanio\AppTemplate-WebUI\docker-entrypoint.sh

set -e

# Default values
VITE_API_URL=${VITE_API_URL:-"http://localhost:5000/api/v1"}
VITE_APP_NAME=${VITE_APP_NAME:-"AppTemplate"}

# Create environment configuration file
cat > /usr/share/nginx/html/env-config.js << EOF
window.ENV = {
  VITE_API_URL: "${VITE_API_URL}",
  VITE_APP_NAME: "${VITE_APP_NAME}"
};
EOF

echo "Environment configuration created:"
cat /usr/share/nginx/html/env-config.js

# Execute the main command
exec "$@"