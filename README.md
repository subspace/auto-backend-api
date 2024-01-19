# Auto PoC Backend API

## Description

This repo is to provide a backend API for Auto PoC project.

**Why this?**

- Because the backend lib functions was not running properly in conjunction with the frontend based on ReactNative. <br/>
Hence, decided to create a backend API to provide the necessary functions to the frontend via API calls.

**Which functions?**

- In terms of function types considering security, the getter functions would first be offloaded here. And then the setter functions would be offloaded here considering this note:

> Unfortunately, the functions based on signing onchain transactions requires the private key to be exposed to the backend API. <br/>
> May be we need to sign it offline & then send the signature to the backend API for further processing of the transaction.

## Build

```sh
yarn build
```

## Development mode

```sh
yarn dev
```

## Production mode

```sh
yarn start
```
