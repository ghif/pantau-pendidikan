# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

# Cloud Run requires listening on $PORT, so we configure nginx via a template
COPY <<EOF /etc/nginx/templates/default.conf.template
server {
    listen 8080;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location ~ ^/api/ai/(.*) {
        resolver 8.8.8.8;
        proxy_pass https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:\$1?key=\$GEMINI_API_KEY;
        proxy_set_header Content-Type "application/json";
        proxy_pass_request_body on;
        proxy_set_header Host generativelanguage.googleapis.com;
    }
}
EOF

# The nginx:alpine image already includes envsubst logic that looks in /etc/nginx/templates/
CMD ["nginx", "-g", "daemon off;"]