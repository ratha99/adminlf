# Use official Node.js image
FROM node:18-alpine 

# Set working directory inside the container
WORKDIR /app 

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application files
COPY . . 

# Build the Vue app
RUN npm run build

# Use nginx to serve the built app
FROM nginx:alpine

# Copy the built files to nginx html directory
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose port 3005
EXPOSE 3005

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
