# ICP Pricing Calculator

You can check out the live version at https://3d5wy-5aaaa-aaaag-qkhsq-cai.icp0.io/

See also the library that this project is based on: https://github.com/dfinity/icp-calculator

## Adding a new ICP feature

In order to add a new ICP feature to the calculator:

1. Add the corresponding cost computation logic to the library: https://github.com/dfinity/icp-calculator
2. Make a new release of the library and bump the dependency here.
3. Add the corresponding UI element class in `src/lib/ts/feature.ts`.
4. Add a new entry to the `FEATURES` table in `src/lib/ts/feature.ts`.
5. If the feature introduces a new cost category, then add it in `src/lib/ts/cost.ts`.

## Running a local server

```
npm run dev
```

## Deploying on local dfx

```
npm run deploy:dev
```

## Deploying on mainnet

```
npm run deploy:dev
```