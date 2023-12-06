const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

/*-------------Helpers-------------*/

const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";
const ether = (n) => {
  return new web3.utils.BN(web3.utils.toWei(n.toString(), "ether"));
};
const tokens = (n) => ether(n);

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports = async function (callback) {
  try {
    // Fetch accounts from wallet
    const accounts = await web3.eth.getAccounts();

    // Set up exchange users
    const deployer = accounts[0];
    const user1 = accounts[1];
    let amount = web3.utils.toWei("10000", "ether");

    // Fetch deployed token
    const token = await Token.deployed();
    console.log("1.- Token fetched: ", token.address);

    // Fetch deployed exchange
    const exchange = await Exchange.deployed();
    console.log("2.- Exchange fetched: ", exchange.address);

    // Give 10k tokens to receiver/user1
    await token.transfer(user1, amount, { from: deployer });
    console.log(`3.- Transferred ${amount} tokens from ${deployer} to ${user1}`);

    /*-----------------*/

    // Deployer deposits 1 ether to exchange
    amount = 1;
    await exchange.depositEther({ from: deployer, value: ether(amount) });
    console.log(`4.- Deposited ${amount} Ether from ${deployer}`);

    // User1 approves tokens for exchange to use
    amount = 10000;
    await token.approve(exchange.address, tokens(amount), { from: user1 });
    console.log(`5.- Approved ${amount} tokens from ${user1}`);

    // User1 deposits tokens
    await exchange.depositToken(token.address, tokens(amount), { from: user1 });
    console.log(`6.- Deposited ${amount} tokens from ${user1}`);

    /*----------------Seed a cancelled order----------------------*/

    let result;
    let orderId;

    // User1 makes order to get tokens
    result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {
      from: deployer,
    });
    console.log(`7.- Make order from ${deployer}`);

    // User1 cancells order
    orderId = result.logs[0].args.id;
    await exchange.cancelOrder(orderId, { from: deployer });
    console.log(`8.- Cancelled order from ${deployer}`);

    /*----------------Seed 3 filled orders----------------------*/

    // Deployer makes order
    result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {
      from: deployer,
    });
    console.log(`Made order from ${deployer}`);

    // User1 fills order
    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user1 });
    console.log(`user1 filled order from ${deployer}`);

    // Wait 1 second for timestamp
    await wait(1);

    /*----------------------*/

    // Deployer makes a second order
    result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), {
      from: deployer,
    });
    console.log(`Made order from ${deployer}`);

    // User1 fills the second  order
    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user1 });
    console.log(`Filled order from ${deployer}`);

    // Wait 1 second
    await wait(1);

    /*----------------------*/

    // Deployer makes final order
    result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), {
      from: deployer,
    });
    console.log(`Made order from ${deployer}`);

    // User 2 fills final order
    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user1 });
    console.log(`Filled order from ${deployer}`);

    // Wait 1 second
    await wait(1);

    /*----------------Seed open orders----------------------*/

    // Deployer makes 10 sell XTK orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), {
        from: deployer,
      });
      console.log(`Made sell order from ${deployer}`);

      // Wait 1 second
      await wait(1);
    }

    // User 2 makes 10 sell XTK orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), {
        from: deployer,
      });
      console.log(`Made order from ${deployer}`);

      // Wait 1 second
      await wait(1);
    }
  } catch (error) {
    console.log(error);
  }

  callback();
};
