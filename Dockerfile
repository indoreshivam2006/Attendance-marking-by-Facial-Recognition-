FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
