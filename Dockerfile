FROM node:20.5.0
WORKDIR /server
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm","start"]