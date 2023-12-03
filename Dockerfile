
# FROM node:latest
FROM node:18

#debug
# RUN echo $(ls -1 /tmp/dir)

# Build server
WORKDIR /tmp/server
COPY /src/server ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Build public client
WORKDIR /tmp/app-public
# Copy sources
COPY /src/app-public ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Build client
WORKDIR /tmp/app
# Copy sources
COPY /src/app ./
# Install dependencies
RUN npm install
# Build files
RUN npm run build

# Compose dist files
WORKDIR /app
WORKDIR /
RUN cp -r tmp/server/dist/. app
RUN cp -r tmp/server/package.json app
RUN cp -r tmp/app-public/dist/. app/public
RUN cp -r tmp/app/dist/. app/public/app

# Install server dependencies again
WORKDIR /app
RUN npm install --omit=dev

# WORKDIR /app
# RUN mkdir server/dist/public
# RUN echo $(ls)
# RUN echo $(ls -1 /server)
# RUN echo $(ls -1 /server/dist)
# RUN cp -r client/dist/. server/dist/public

# Cleanup
WORKDIR /
RUN rm -rf tmp

# Container start
WORKDIR /app
EXPOSE 3000
ENV NODE_ENV="production"
CMD [ "node", "app.js" ]
