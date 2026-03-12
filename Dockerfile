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
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# The nginx:alpine image already includes envsubst logic that looks in /etc/nginx/templates/
CMD ["nginx", "-g", "daemon off;"]