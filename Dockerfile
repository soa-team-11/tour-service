# 1. Use official Node.js LTS image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies (only prod, no dev like nodemon)
RUN npm install --omit=dev

# 5. Copy the rest of the code
COPY . .

# 6. Expose the app port
EXPOSE 5002

# 7. Run the app
CMD ["node", "src/index.js"]
