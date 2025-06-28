FROM node:20-alpine

WORKDIR /app

# First install dependencies
COPY package*.json ./
RUN npm install

# Then copy the rest of the application
COPY . .

# Start the development server
CMD ["npm", "start"]
