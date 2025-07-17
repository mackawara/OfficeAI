FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache git python3 make g++

# Create and set working directory
RUN mkdir -p /code
WORKDIR /code

# Copy only necessary files (ignored in .dockerignore)
COPY package.json yarn.lock /code/
RUN yarn install --frozen-lockfile

# Copy the rest of the source code
COPY . /code

# Build the project
RUN yarn build

# Copy start script and set permissions
COPY start.sh /code/start.sh
RUN chmod +x /code/start.sh 

EXPOSE 3000
CMD ["/code/start.sh"] 