# Decentralized Exchange

VISIT PROJECT WEBPAGE: https://dex-react-rosy.vercel.app/

---

![Imgur](https://i.imgur.com/IYV31pW.png)

> Rinkeby Testnet DEX dapplication

---

## Table of Contents

- [Description](#description)

- [How To Use](#how-to-use)

- [Installation](#installation)

- [References](#references)

- [Author Info](#author-info)

---

## Description

Decentralized exchanges (DEX) are a type of cryptocurrency exchange which allows for direct peer-to-peer cryptocurrency transactions to take place online securely on a blockchain and without the need for an intermediary or central authority.
In this project, there is one type of ERC-20 token (with no real value) at disposal for exchange, which is the XTAKE (XTK).

### Technologies used:

- Solidity
- Truffle
- Ganache
- Web3.js
- React JS
- Redux
- Bootstrap
- Alchemy endpoint
- Ethereum blockchain

[Back To The Top](#decentralized-exchange)

---

## How To Use

For interaction with the project, the users must have a wallet connected to the browser. Metamask was the one used for development and testing of this exchange.

1.- Log in with your Metamask account and make sure that:

&nbsp; &nbsp; &nbsp; a) You are on the Rinkeby Test Network, and

![Imgur](https://i.imgur.com/L45pKPm.png)

&nbsp; &nbsp; &nbsp; b) You have connected your account to the Dapplication

![Imgur](https://i.imgur.com/LYMjNRJ.png)

2.- For new users, it is neccesary to deposit some test ETH on the exchange smart contract since it is needed for buying the XTK token.

![Imgur](https://i.imgur.com/3aec86K.png)

![Imgur](https://i.imgur.com/I7ZNIP7.png)

You can get Rinkeby test ETH [HERE](https://faucets.chain.link/rinkeby)

3.- Once the exchange balance is loaded with test ETH, you may proceed to buy tokens which you can do two ways:

&nbsp; &nbsp; &nbsp; a) By executing/filling an order placed on the order book.

![Imgur](https://i.imgur.com/pjtf0IR.png)

&nbsp; &nbsp; &nbsp; b) By placing a new buy order with the desired amount of tokens to buy and the ETH amount willing to pay.

![Imgur](https://i.imgur.com/aHv9Hve.png)

After placing the order successfully, your order will appear on the order book as well as on your "My Open Orders" tab inside your "My Transactions" component.

At this point, if you want to, you can cancel the transaction by clicking the X button.

![Imgur](https://i.imgur.com/ZJy9kxa.png)

![Imgur](https://i.imgur.com/UTQiF9l.png)

After the order is filled, the transaction will appear on the "My transactions" tab annd your ETH and XTK balances will be updated.

![Imgur](https://i.imgur.com/EgZQKa5.png)

![Imgur](https://i.imgur.com/ILTlATB.png)

4.- When you are finished with the transactions wanted (and anytime), you can withdraw your unspent ETH from the DEX balance back to your Metamask wallet as well as your new XTK tokens, if you are not willing to sell them anymore.

NOTE: For executing succesfully a buy-token transaction, it is crucial that the user has at least 1% more ETH than the spending value because this is the fee amount which goes to the exchange's Smart Contract deployer. Also, you need to take into consideration the gas fees of the network.

If you run into any trouble trying to execute a transaction, try refreshing the webpage and resetting your account by going to your Metamask wallet ang click on "Settings > Advanced > Reset Account". This won't affect your balances by any means.

[Back To The Top](#decentralized-exchange)

## Installation

- For testing this application on a local environment, you will need to clone this repository and run the following commands on the root folder for installing dependencies and running the local server:

```bash
npm i
npm start
```

- For creating a build production of the project, you may run the command

```bash
npm run build
```

## References

This project is the result of the content of Dapp University's [Bootcamp](https://dappuniversity.teachable.com/p/blockchain-developer-bootcamp).

---

## Author Info

- Twitter - [@juanxavier](https://twitter.com/juanxavier)
- LinkedIn - [juanxaviervalverde](https://www.linkedin.com/in/juanxaviervalverde/)

[Back To The Top](#decentralized-exchange)
