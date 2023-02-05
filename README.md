# sbtc-bridge

![ci](https://github.com/Trust-Machines/sbtc-bridge/actions/workflows/ci.yml/badge.svg)

## Introduction

Sbtc-bridge supports a trustless two way peg between BTC and sBTC.
sBTC is a SIP-010 fungible token on the Stacks Blockchain that can be used in
defi protocols, nft marketplaces, governance and many more applications.

## Testnet

App has been tested with the Electrum wallet. On MacOs open Electrum wallet on testnet;

```bash
/Applications/Electrum.app/Contents/MacOS/run_electrum --testnet
```

To load the transaction;

1. Tools
2. Load Transaction
3. From text

Paste in the hex generated by the app. Check the tx fees. Sign and broadcast the tx.

### Wallet Support

#### Ledger Live

Ledger Live is the interface for Ledger hardware wallets

Note this is NOT Ledger Connect - Ledger Connect is  browser extension only supporting Safari and Ethereum/Polygon chains.

Test Mode

1. Download
2. Ledger on Bitcoin testnet
3. Enable developer mode

Links

- [Ledger Live](https://www.ledger.com/ledger-live)
- [Ledger on Testnet](https://developers.ledger.com/docs/non-dapp/howto/test/)
- [Article on Testnet Setup](https://coinguides.org/ledger-testnet/)

#### Trezor Suite

Trezor Suite is the interface for Trezor hardware wallets

- [Trezor Suite Download](https://trezor.io/trezor-suite)
- [Trezor Bridge Download](https://suite.trezor.io/web/bridge/)
- [Using OP_RETURN with Trezor](https://trezor.io/learn/a/use-op_return-in-trezor-suite-app)

Trezor hardware wallet can be paired with Electrum

Transaction signing error: -22: TX decode failed. Make sure the tx has at least one input.


## Development

```bash
npm install
npm install sass
npm run dev
# or
npm run dev -- --open
```

### Deployment

First build the application;

```bash
npm run build
```

Note you can preview the production build locally with `npm run preview`.

#### Github Pages

Requires access to github settings and for a branch `gh-pages` to be created from `main`.
Then run;

```bash
node ./gh-pages.js
```

This pushes the contents of `build/` to the `gh-pages` branch. Github Pages
has been configured on the repository to serve the application from;

```bash
https://trust-machines.github.io/sbtc-bridge
```

The basic strategy is to deploy the `distribution files` to a branch called `gh-pages` and then configure Github Pages to serve the application from there. Details on Github Pages and Svelte
applications can be found in these guides.

- [Github Pages how to](https://docs.github.com/en/pages)
- [Svelte + Github Pages how to](https://github.com/sveltejs/kit/tree/master/packages/adapter-static#spa-mode)

#### Linode / Digital Ocean

Create your preferred target environment (Debian VM + Nginx for example).
Update the deploy script with your config and add your public ssh key to known hosts.
Then run;

```bash
bash ./deploy-remote.sh
```

### Packaging

The application can be packaged and uploaded to the npm registry;

```bash
./node_modules/.bin/svelte-kit package
cd package
npm publish
```

## Bundling bitcoinjs-lib

This application ports the Bitcoinjs library by polyfilling nodejs dependencies.
Alternatively Bitcoinjs can be bundled using browserify (see Pre-Compiling Bitcoinjs Module
below).

The polyfill is mainly for the Buffer library and some associated dedendencies such as Transform/stream.
See `vite.config.js` for details on polyfilling for development and production build environments.

### Pre-Compiling Bitcoinjs Module

See [How to Browserify](https://github.com/bitcoinjs/bitcoinjs-lib/issues/965).

Following the advice here (after uninstalling/re-installing browserify) led to
a javascript module.

Get correct browserify by checking and sym linking;

```bash
npm install -g browserify
npm install -g uglify-es
/Users/mikey/.nvm/versions/node/v16.14.2/bin/browserify --version
ln -s /Users/mikey/.nvm/versions/node/v16.14.2/bin/browserify /usr/local/bin/browserify
```

Download bitcoinjs from the latest tag;

```bash
git clone git@github.com:bitcoinjs/bitcoinjs-lib.git
cd bitcoinjs-lib
git fetch --all
git checkout f221e1f7ac01c11b715e3398e04514a7df64ae42
npm install
```

Bundle the library and its dependencies;

```bash
browserify -r . --standalone bitcoinjs > bitcoinjs.js
uglifyjs -c --mangle reserved=['BigInteger','ECPair','Point'] bitcoinjs.js > bitcoinjs.min.js
```

Svelte configuration;

```bash
cp bitcoinjs.* ../multisig-svelte/static/public
```

in app.html add

```bash
<script src="%sveltekit.assets%/public/bitcoinjs.js"></script>
```

Note this will be bitcoinjs.min.js in production.
