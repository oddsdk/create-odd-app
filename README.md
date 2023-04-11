# Create ODD App (COA)

[![Built by FISSION](https://img.shields.io/badge/⌘-Built_by_FISSION-purple.svg)](https://fission.codes) [![Built by FISSION](https://img.shields.io/badge/@oddjs/odd-v0.37.0-purple.svg)](https://github.com/oddsdk/ts-odd) [![Discord](https://img.shields.io/discord/478735028319158273.svg)](https://discord.gg/zAQBDEq) [![Discourse](https://img.shields.io/discourse/https/talk.fission.codes/topics)](https://talk.fission.codes)

CWA is a CLI generator that allows you to spin up either React or SvelteKit flavours of Fission's [ODD App Template](https://github.com/oddsdk/odd-app-template) and [ODD WalletAuth](https://github.com/oddsdk/walletauth) repos.

## 🎬 Demo

https://user-images.githubusercontent.com/1179291/195956380-8c1442fa-75d9-4167-8e0f-b8660d40e149.mp4

## 💻 Getting Started

You can use the following commands via your package manager of choice to invoke `create-odd-app`

```bash
npx create-odd-app
# or
yarn create odd-app
# or
pnpm create odd-app
```

### Options

You can invoke `create-odd-app` directly with an app name or you can wait to be prompted to set one:

```bash
npx create-odd-app my-odd-app
# or
yarn create odd-app my-odd-app
# or
pnpm create odd-app my-odd-app
```

`create-odd-app` also comes with the following options:

- **--use-sveltekit** - Explicitly tell the CLI to build the application using [SvelteKit](https://kit.svelte.dev/)
- **--use-react** - Explicitly tell the CLI to build the application using [React](https://reactjs.org/)
- **--use-walletauth** - Explicitly tell the CLI to build the application using the ODD [WalletAuth flow](https://github.com/oddsdk/walletauth)
- **--use-webcrypto** - Explicitly tell the CLI to build the application using the ODD [Device Linking flow](https://github.com/oddsdk/odd-app-template)
- **--use-npm** - Explicitly tell the CLI to bootstrap the app using `npm`. This is the default option.
- **--use-pnpm** - Explicitly tell the CLI to bootstrap the app using `pnpm`. To bootstrap using pnpm we recommend running `pnpm create odd-app`
- **--use-yarn** - Explicitly tell the CLI to bootstrap the app using `yarn`. To bootstrap using pnpm we recommend running `yarn create odd-app`

## 🤔 What's The ODD SDK?

[The ODD SDK](https://github.com/fission-codes/odd) empowers developers to build fully distributed web applications without needing a complex back-end. The SDK provides:

- user accounts (via [the browser's Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)),
- authorization (using [UCAN](https://ucan.xyz))
- encrypted file storage (via the [ODD File System](https://guide.fission.codes/developers/odd/file-system-wnfs), backed by the [InterPlanetary File System](https://ipfs.io/), or IPFS)
- and key management (via websockets and a two-factor auth-like flow).

ODD applications work offline and store data encrypted for the user by leveraging the power of the web platform. You can read more about the ODD SDK in Fission's [ODD Guide](https://guide.fission.codes/developers/odd).

## 🚀 Contributing

```bash
git clone git@github.com:oddsdk/create-odd-app.git
cd create-odd-app
nvm use
npm i
npm run dev
```
