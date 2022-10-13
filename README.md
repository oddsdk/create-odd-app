# Create Webnative App (CWA)

[![Built by FISSION](https://img.shields.io/badge/⌘-Built_by_FISSION-purple.svg)](https://fission.codes) [![Built by FISSION](https://img.shields.io/badge/webnative-v0.34.1-purple.svg)](https://github.com/fission-suite/webnative) [![Discord](https://img.shields.io/discord/478735028319158273.svg)](https://discord.gg/zAQBDEq) [![Discourse](https://img.shields.io/discourse/https/talk.fission.codes/topics)](https://talk.fission.codes)

CWA is a generator that allows you to spin either React or SvelteKit flavours of Fission's Webnative App Template and Webnative WalletAuth repos.

## Demo

<video width="600" autoplay loop>
  <source src="https://ipfs.runfission.com/ipns/hamdii.files.fission.name/p/Video/cwa.mov" type="video/mp4">
</video>

## Usage

You can use the following commands via your package manager of choice to invoke `create-webnative-app`

```bash
npx create-webnative-app@latest
# or
yarn create webnative-app
# or
pnpm create webnative-app
```

### Options

`create-webnative-app` comes with the following options:

- **--use-npm** - Explicitly tell the CLI to bootstrap the app using `npm`. This is the default option.
- **--use-pnpm** - Explicitly tell the CLI to bootstrap the app using `pnpm`. To bootstrap using pnpm we recommend running `pnpm create webnative-app`
- **--use-yarn** - Explicitly tell the CLI to bootstrap the app using `yarn`. To bootstrap using pnpm we recommend running `yarn create webnative-app`
- **--use-sveltekit** - Explicitly tell the CLI to build the application using [SvelteKit](https://kit.svelte.dev/)
- **--use-react** - Explicitly tell the CLI to build the application using [React](https://reactjs.org/)
- **--use-walletauth** - Explicitly tell the CLI to build the application using Webnative's [WalletAuth flow](https://github.com/webnative-examples/walletauth)
- **--use-devicelinking** - Explicitly tell the CLI to build the application using Webnative's [Device Linking flow](https://github.com/webnative-examples/webnative-app-template)

## 🤔 What's Webnative?

[The Webnative SDK](https://github.com/fission-codes/webnative) empowers developers to build fully distributed web applications without needing a complex back-end. The SDK provides:

- user accounts (via [the browser's Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)),
- authorization (using [UCAN](https://ucan.xyz))
- encrypted file storage (via the [Webnative File System](https://guide.fission.codes/developers/webnative/file-system-wnfs), backed by the [InterPlanetary File System](https://ipfs.io/), or IPFS)
- and key management (via websockets and a two-factor auth-like flow).

Webnative applications work offline and store data encrypted for the user by leveraging the power of the web platform. You can read more about Webnative in Fission's [Webnative Guide](https://guide.fission.codes/developers/webnative).

## 🚀 Contributing

```bash
git clone git@github.com:webnative-examples/create-webnative-app.git
cd create-webnative-app
nvm use
npm i
npm run dev
```
