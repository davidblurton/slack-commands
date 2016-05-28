FROM node:6.2.0

ENV HOME=/code

COPY package.json npm-shrinkwrap.json $HOME/

WORKDIR $HOME
RUN npm install

ADD . $HOME
EXPOSE 3000
CMD ["npm", "start"]