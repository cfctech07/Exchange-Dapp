require('chai').use(require('chai-as-promised')).should();

import {tokens, ether, EVM_REVERT, ETHER_ADDRESS} from './helpers';

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
	let token;
	let exchange;
	const feePercent = 10;

	/*------------------------------------------------*/

	beforeEach(async () => {
		// Deploy token contract
		token = await Token.new();

		// Transfer 100 tokens from deployer to user1
		token.transfer(user1, tokens(100), {from: deployer});

		// Deploy exchange with fee values in constructor
		exchange = await Exchange.new(feeAccount, feePercent);
	});

	/*--------------------Deployment---------------------*/

	describe('Deployment', () => {
		it('Tracks the fee account', async () => {
			const result = await exchange.feeAccount();
			result.should.equal(feeAccount);
		});

		it('Tracks the fee percent', async () => {
			const result = await exchange.feePercent();
			result.toString().should.equal(feePercent.toString());
		});
	});

	/*---------------------Fallback----------------------*/

	describe('Fallback', () => {
		it('reverts when Ether is sent to contract', async () => {
			await exchange
				.sendTransaction({value: 1, from: user1})
				.should.be.rejectedWith(EVM_REVERT);
		});
	});

	/*----------------Depositing ether-------------------*/

	describe('Depositing ether', async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = ether(1);
			result = await exchange.depositEther({from: user1, value: amount});
		});

		it('tracks the ether deposit', async () => {
			const balance = await exchange.tokens(ETHER_ADDRESS, user1);
			balance.toString().should.equal(amount.toString());
		});

		it('Emits Deposit event', async () => {
			const log = result.logs[0];
			log.event.should.equal('Deposit');

			const event = log.args;
			event.token.toString().should.equal(ETHER_ADDRESS, 'address is correct');
			event.user.toString().should.equal(user1, 'user is correct');
			event.amount.toString().should.equal(amount.toString(), 'amount is correct');
			event.balance.toString().should.equal(amount.toString(), 'balance is correct');
		});
	});

	/*----------------Withdrawing ether------------------*/

	describe('Withdrawing ether', async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = ether(1);
			result = await exchange.depositEther({from: user1, value: ether(1)});
		});

		describe('Success', async () => {
			beforeEach(async () => {
				result = await exchange.withdrawEther(amount, {from: user1});
			});

			it('Withdraws ether funds and sets balance to zero', async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1);
				balance.toString().should.equal('0');
			});

			it('Emits Withdraw event', async () => {
				const log = result.logs[0];
				log.event.should.equal('Withdraw');

				const event = log.args;
				event.token.toString().should.equal(ETHER_ADDRESS, 'address is correct');
				event.user.toString().should.equal(user1, 'user is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal('0', 'balance is correct');
			});
		});

		/*---------------------------------------------------------*/

		describe('Failure', () => {
			it('rejects withdraws for insufficient balances', async () => {
				await exchange
					.withdrawEther(ether(2), {from: user1})
					.should.be.rejectedWith(EVM_REVERT);
			});
		});
	});

	/*---------------Depositing tokens------------------*/

	describe('Depositing tokens', () => {
		let result;
		let amount;

		/*-------------Success----------------*/

		describe('Success', () => {
			beforeEach(async () => {
				amount = tokens(10);
				await token.approve(exchange.address, amount, {from: user1});

				result = await exchange.depositToken(token.address, amount, {
					from: user1,
				});
			});

			it('tracks the token deposit', async () => {
				let balance;

				// Check exchange balance on token contract
				balance = await token.balanceOf(exchange.address);
				balance.toString().should.equal(amount.toString());

				// Check user1 balance on exchange contract
				balance = await exchange.tokens(token.address, user1);
				balance.toString().should.equal(amount.toString());
			});

			it('Emits Deposit event', async () => {
				const log = result.logs[0];
				log.event.should.equal('Deposit');

				const event = log.args;
				event.token.toString().should.equal(token.address, 'address is correct');
				event.user.toString().should.equal(user1, 'user is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal(amount.toString(), 'balance is correct');
			});
		});

		/*-------------Failure----------------*/

		describe('Failure', () => {
			it('rejects ether deposits', async () => {
				await exchange
					.depositToken(ETHER_ADDRESS, tokens(10), {from: user1})
					.should.be.rejectedWith(EVM_REVERT);
			});

			it('Fails when no tokens are approved', async () => {
				await exchange
					.depositToken(token.address, amount, {from: user1})
					.should.be.rejectedWith(EVM_REVERT);
			});
		});
	});

	/*---------------Withdrawing tokens-----------------*/

	describe('Withdrawing tokens', async () => {
		let result;
		let amount;

		describe('Success', async () => {
			beforeEach(async () => {
				amount = tokens(10);

				// Deposit tokens
				await token.approve(exchange.address, amount, {from: user1});
				await exchange.depositToken(token.address, amount, {from: user1});

				// Withdraw tokens
				result = await exchange.withdrawToken(token.address, amount, {from: user1});
			});

			it('withdraws token funds', async () => {
				const balance = await exchange.tokens(token.address, user1);
				balance.toString().should.equal('0');
			});

			it('Emits Withdraw event', async () => {
				const log = result.logs[0];
				log.event.should.equal('Withdraw');

				const event = log.args;
				event.token.toString().should.equal(token.address, 'address is correct');
				event.user.toString().should.equal(user1, 'user is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal('0', 'balance is correct');
			});
		});

		/*------------------------------------------------*/

		describe('Failure', async () => {
			it('rejects ether withdraws', async () => {
				await exchange
					.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1})
					.should.be.rejectedWith(EVM_REVERT);
			});

			it('fails for insufficient balances', async () => {
				await exchange
					.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1})
					.should.be.rejectedWith(EVM_REVERT);
			});
		});
	});

	/*-------------------Check balance-------------------*/

	describe('Checking balance', async () => {
		beforeEach(async () => {
			await exchange.depositEther({from: user1, value: ether(1)});
		});

		it('returns user balance', async () => {
			const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
			result.toString().should.equal(ether(1).toString());
		});
	});

	/*-------------------Making orders-----------------------------*/

	describe('Making orders', async () => {
		let result;

		// Get 1 token in exchange of 1 Ether from user1
		beforeEach(async () => {
			result = await exchange.makeOrder(
				token.address,
				tokens(1),
				ETHER_ADDRESS,
				ether(1),
				{
					from: user1,
				}
			);
		});

		it('Tracks the newly created order', async () => {
			// Get count of new order
			const orderCount = await exchange.orderCount();
			orderCount.toString().should.equal('1');

			// Get order in exchange contract mapping
			// and access its attributes to check if they are correct
			const order = await exchange.orders('1');
			order.id.toString().should.equal('1', 'ID is correct');
			order.user.should.equal(user1, 'user is correct');
			order.tokenGet.should.equal(token.address, 'tokenGet is correct');
			order.amountGet
				.toString()
				.should.equal(tokens(1).toString(), 'amountGet is correct');
			order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
			order.amountGive
				.toString()
				.should.equal(ether(1).toString(), 'amountGive is correct');
			order.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
		});

		it('emits an Order event', async () => {
			const log = result.logs[0];
			log.event.should.equal('Order');

			const event = log.args;
			event.id.toString().should.equal('1', 'ID is correct');
			event.user.should.equal(user1, 'user is correct');
			event.tokenGet.should.equal(token.address, 'tokenGet is correct');
			event.amountGet
				.toString()
				.should.equal(tokens(1).toString(), 'amountGet is correct');
			event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
			event.amountGive
				.toString()
				.should.equal(ether(1).toString(), 'amountGive is correct');
			event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
		});
	});

	/*-------------------Order actions-----------------------------*/

	describe('Order actions', async () => {
		beforeEach(async () => {
			// user1 deposits 1 ether on exchange
			await exchange.depositEther({from: user1, value: ether(1)});

			// deployer gives 100 tokens to user2
			await token.transfer(user2, tokens(100), {from: deployer});

			// user2 deposits 2 tokens only
			await token.approve(exchange.address, tokens(2), {from: user2});
			await exchange.depositToken(token.address, tokens(2), {from: user2});

			// user1 makes an order to buy 1 token with 1 Ether
			await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {
				from: user1,
			});
		});

		/*------------------Filling orders------------------*/

		describe('Filling orders', async () => {
			let result;

			describe('Success', async () => {
				beforeEach(async () => {
					// User2 fills order
					result = await exchange.fillOrder('1', {from: user2});
				});

				//user2 should receive 10% less ether
				it('executes the trade & charges fees', async () => {
					let balance;
					balance = await exchange.balanceOf(token.address, user1);
					balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens');

					balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
					balance.toString().should.equal(ether(1).toString(), 'user2 received Ether');

					balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
					balance.toString().should.equal('0', 'user1 Ether deducted');

					balance = await exchange.balanceOf(token.address, user2);
					balance
						.toString()
						.should.equal(
							tokens(0.9).toString(),
							'user2 tokens deducted with fee applied'
						);

					const feeAccount = await exchange.feeAccount();
					balance = await exchange.balanceOf(token.address, feeAccount);
					balance
						.toString()
						.should.equal(tokens(0.1).toString(), 'feeAccount received fee');
				});

				it('updates filled orders', async () => {
					const orderFilled = await exchange.orderFilled(1);
					orderFilled.should.equal(true);
				});

				it('emits a "Trade" event', () => {
					const log = result.logs[0];
					log.event.should.eq('Trade');

					const event = log.args;
					event.id.toString().should.equal('1', 'id is correct');
					event.user.should.equal(user1, 'user is correct');
					event.tokenGet.should.equal(token.address, 'tokenGet is correct');
					event.amountGet
						.toString()
						.should.equal(tokens(1).toString(), 'amountGet is correct');
					event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
					event.amountGive
						.toString()
						.should.equal(ether(1).toString(), 'amountGive is correct');
					event.userFill.should.equal(user2, 'userFill is correct');
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
				});
			});

			describe('failure', () => {
				it('rejects invalid order ids', () => {
					const invalidOrderId = 99999;
					exchange
						.fillOrder(invalidOrderId, {from: user2})
						.should.be.rejectedWith(EVM_REVERT);
				});

				it('rejects already-filled orders', () => {
					// Fill the order
					exchange.fillOrder('1', {from: user2}).should.be.fulfilled;
					// Try to fill it again
					exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT);
				});

				it('rejects cancelled orders', () => {
					// Cancel the order
					exchange.cancelOrder('1', {from: user1}).should.be.fulfilled;
					// Try to fill the order
					exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT);
				});
			});
		});

		/*-----------------Cancelling orders----------------*/

		describe('Cancelling orders', async () => {
			let result;

			describe('Success', async () => {
				beforeEach(async () => {
					result = await exchange.cancelOrder('1', {from: user1});
				});

				it('Updates cancelled orders', async () => {
					const orderCancelled = await exchange.orderCancelled(1);
					orderCancelled.should.equal(true);
				});

				it('emits an Cancel event', async () => {
					const log = result.logs[0];
					log.event.should.equal('Cancel');

					const event = log.args;

					event.id.toString().should.equal('1', 'ID is correct');
					event.user.should.equal(user1, 'user is correct');
					event.tokenGet.should.equal(token.address, 'tokenGet is correct');
					event.amountGet
						.toString()
						.should.equal(tokens(1).toString(), 'amountGet is correct');
					event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
					event.amountGive
						.toString()
						.should.equal(ether(1).toString(), 'amountGive is correct');
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
				});
			});

			describe('Failure', async () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderId = 99999;
					await exchange
						.cancelOrder(invalidOrderId, {from: user1})
						.should.be.rejectedWith(EVM_REVERT);
				});

				it('rejects unauthorized cancelations', async () => {
					await exchange
						.cancelOrder('1', {from: user2})
						.should.be.rejectedWith(EVM_REVERT);
				});
			});
		});
	});
});
