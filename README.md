*Blockchain Explorer*

This project implements three use cases:

- Present a visual of blocks being added to an Ethereum blockchain.
- Check an account's balance.
- Monitor accounts for received transactions.

It requires a .env file with the following variables:

- SERVER_PORT
- PROVIDER_URL

The server needs to be started prior to running the client:
> node server/index.js

The project makes use of [Bootstrap](https://getbootstrap.com) for css and [Animate](https://animate.style) for animations.