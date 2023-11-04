
# FROM node:latest
FROM node:18

#debug
# RUN echo $(ls -1 /tmp/dir)

# Build client
WORKDIR /app/client
# Copy sources
COPY /src/client ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Build server
WORKDIR /app/server
COPY /src/server ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Compose dist files
WORKDIR /app
RUN mkdir server/dist/public
# RUN echo $(ls)
# RUN echo $(ls -1 /server)
# RUN echo $(ls -1 /server/dist)
RUN cp -r client/dist/. server/dist/public

# Cleanup
WORKDIR /app
RUN rm -rf client

# Container start
WORKDIR /app/server/dist
EXPOSE 3000
ENV NODE_ENV="production"
CMD [ "node", "index.js" ]
