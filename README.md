## About

**Sarthi Product**

## Development Setup

1. `git clone https://github.com/valluri/saradhi-product.git`
2. `cd saradhi-product`
3. Ensure that you have a `.npmrc` in the root folder to read the library package
4. `npm i`
5. run `npm install --legacy-peer-deps` if you get a `unable to resolve dependency tree` error.

## Related Services

- Postgres. (you will need to manually run the scripts from the **src\database** folder against the **DM** database)

## Build

`npm run build`

## Run

`npm run serve` or run from `saradhi-deploy\run.cmd`

## Test

`npm test`
`jest --clearCache` to clear the test cache

## License

Copyright © 2021-present **SubK Impact Solutions**
