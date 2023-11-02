
# FROM node:latest
FROM node:18

#debug
# RUN echo $(ls -1 /tmp/dir)

# Build client
WORKDIR /src/client
# Copy sources
COPY /src/client ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Build server
WORKDIR /src/server
# Copy config
# COPY /src/server/package*.json ./
# COPY /src/server/tsconfig*.json ./
# COPY /src/server/.env .env
# Copy sources
# COPY /src/server/index.ts index.ts
# COPY /src/server/src src
COPY /src/server ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Compose dist files
WORKDIR /src
RUN mkdir server/dist/public
# RUN echo $(ls)
# RUN echo $(ls -1 /server)
# RUN echo $(ls -1 /server/dist)
RUN cp -r client/dist server/dist/public
# COPY client/dist server/dist/public

# Cleanup
WORKDIR /src
RUN rm -rf client

# Container start
WORKDIR /src/server/dist
EXPOSE 3000
ENV NODE_ENV="production"
CMD [ "node", "index.js" ]
