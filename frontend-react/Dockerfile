# Etapa 1: compilar el proyecto React (Node completo, no llega a la imagen final)
FROM node:20-alpine AS build
WORKDIR /app

# Copiar primero solo lo necesario para instalar dependencias — Docker cachea esta capa
# y no la vuelve a reinstalar mientras package*.json no cambien, aunque el codigo si cambie despues.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: imagen final, solo Nginx sirviendo los archivos estaticos ya compilados (build/)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
