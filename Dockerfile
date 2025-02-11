FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY . .
# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000
CMD ["node","app.js"]