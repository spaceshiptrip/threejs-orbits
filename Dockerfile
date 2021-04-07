FROM node:12

# set working directory
WORKDIR /app

# update your path to find the app
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN yarn install

# add the whole shibang to the container
COPY . /app

# what's the docker port you want to connect to?
EXPOSE 3000

# run the server application
CMD [ "node", "app.js" ]
