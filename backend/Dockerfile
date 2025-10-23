# ---- Dockerfile Backend Node.js ----
FROM node:18-bullseye

# Instalar Python 3, pip y dependencias del sistema
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev \
    build-essential libglib2.0-0 libsm6 libxext6 libxrender-dev ffmpeg && \
    ln -sf python3 /usr/bin/python && \
    pip3 install --upgrade pip setuptools wheel

WORKDIR /app

# Copiar dependencias Node.js
COPY package*.json ./

# Instalar dependencias de Node.js (solo producción)
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Instalar dependencias Python (DeepFace, TensorFlow, OpenCV, etc.)
RUN if [ -f requeriments.txt ]; then pip3 install --no-cache-dir -r requeriments.txt; fi

# Crear usuario y carpetas seguras
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nodejs && \
    mkdir -p uploads/photos uploads/fingerprints uploads/signatures uploads/temp uploads/privacy-notice && \
    chown -R nodejs:nodejs /app && chmod -R 755 /app/uploads

USER nodejs


# Exponer puerto
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Comando de ejecución
CMD ["node", "app.js"]
