# Toy Robot Simulator

REA Coding exercise


## Prerequisites
Building/running requires a system with nodejs(tested with nodejs16).

Install dependencies:
```bash
npm install
```

## Running tests

```bash
npm run test
```

## Running interactive CLI

```bash
npm run start
```

## Using docker

If you don't have a nodejs environment setup locally, 
you can use the below command to start one.
```bash
docker run --rm -it -v $(pwd):/home -w /home --entrypoint /bin/bash node:16
```