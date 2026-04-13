# ============================================================
# frontend/Dockerfile
# ============================================================
# React + Vite dev server container
# Node 20 Alpine — very small image
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

EXPOSE 5173

# --host 0.0.0.0 makes Vite accessible from outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
