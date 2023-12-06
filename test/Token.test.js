const Token = artifacts.require('./Token');
import {tokens, EVM_REVERT} from './helpers';
require('chai').use(require('chai-as-promised')).should();

contract('Token', ([deployer, receiver, exchange]) => {
	let token;
	const name = 'Xtake Token';
	const symbol = 'XTK';
	const decimals = '18';
	const totalSupply = String(tokens(1000000));

	beforeEach(async () => {
		token = await Token.new();
	});

	/*--------------------Deployment---------------------*/

	describe('Deployment', () => {
		it('Tracks the name', async () => {
			const result = await token.name();
			result.should.equal(name);
		});

		it('Tracks the symbol', async () => {
			const result = await token.symbol();
			result.should.equal(symbol);
		});

		it('Tracks the decimals', async () => {
			const result = await token.decimals();
			result.toString().should.equal(decimals);
		});

		it('Tracks the total supply', async () => {
			const result = await token.totalSupply();
			result.toString().should.equal(totalSupply.toString());
		});

		it('Assings total supply to deployer', async () => {
			const result = await token.balanceOf(deployer);
			result.toString().should.equal(totalSupply.toString());
		});
	});

	/*-------------------Send tokens---------------------*/

	describe('Sending tokens', () => {
		let amount;
		let result;

		/*-------------Success---------------*/

		describe('Success', async () => {
			beforeEach(async () => {
				amount = tokens(100);
				result = await token.transfer(receiver, amount, {from: deployer});
			});

			it('Transfers token balances', async () => {
				let balanceOf;

				balanceOf = await token.balanceOf(deployer);
				balanceOf.toString().should.equal(tokens(999900).toString());

				balanceOf = await token.balanceOf(receiver);
				balanceOf.toString().should.equal(tokens(100).toString());
			});

			it('Emits Transfer event', async () => {
				const log = result.logs[0];
				log.event.should.equal('Transfer');

				const event = log.args;
				event._from.toString().should.equal(deployer, 'from is correct');
				event._to.toString().should.equal(receiver, 'to is correct');
				event._value.toString().should.equal(amount.toString(), 'amount is correct');
			});
		});

		/*------------Failure----------------*/

		describe('Failure', async () => {
			it('rejects insufficient balances', async () => {
				let invalidAmount;
				invalidAmount = tokens(100000000);

				await token
					.transfer(receiver, invalidAmount, {from: deployer})
					.should.be.rejectedWith(EVM_REVERT);

				invalidAmount = tokens(10);
				await token
					.transfer(deployer, invalidAmount, {from: receiver})
					.should.be.rejectedWith(EVM_REVERT);
			});

			it('rejects invalid recipients', async () => {
				await token.transfer(0x0, amount, {from: deployer}).should.be.rejected;
			});
		});
	});

	/*--------------------Approving----------------------*/

	describe('Approving tokens', () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = tokens(100);
			result = await token.approve(exchange, amount, {from: deployer});
		});

		describe('Success', () => {
			it('Allocates an allowance for delegated token spending for the exchange', async () => {
				const allowance = await token.allowance(deployer, exchange);
				allowance.toString().should.equal(amount.toString());
			});

			it('Emits an Approval event', async () => {
				const log = result.logs[0];
				log.event.should.equal('Approval');

				const event = log.args;
				event._owner.toString().should.equal(deployer, 'owner is correct');
				event._spender.toString().should.equal(exchange, 'spender is correct');
				event._value.toString().should.equal(amount.toString(), 'value is correct');
			});
		});

		/*------------------------------------*/

		describe('Failure', () => {
			it('Rejects invalid spenders', async () => {
				await token.approve(0x0, amount, {from: deployer}).should.be.rejected;
			});
		});
	});

	/*--------------Delegated transfers------------------*/

	describe('Delegated token transfers', () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = tokens(100);
			await token.approve(exchange, amount, {from: deployer});
		});

		/*------------------------------------*/

		describe('Success', async () => {
			beforeEach(async () => {
				result = await token.transferFrom(deployer, receiver, amount, {from: exchange});
			});

			it('Transfers token balances', async () => {
				let balanceOf;

				balanceOf = await token.balanceOf(deployer);
				balanceOf.toString().should.equal(tokens(999900).toString());

				balanceOf = await token.balanceOf(receiver);
				balanceOf.toString().should.equal(tokens(100).toString());
			});

			it('Resets the allowance', async () => {
				const allowance = await token.allowance(deployer, exchange);
				allowance.toString().should.equal('0');
			});

			it('Emits a Transfer event', async () => {
				const log = result.logs[0];
				log.event.should.equal('Transfer');

				const event = log.args;
				event._from.toString().should.equal(deployer, 'from is correct');
				event._to.should.equal(receiver, 'to is correct');
				event._value.toString().should.equal(amount.toString(), 'value is correct');
			});
		});

		/*------------------------------------*/

		describe('Failure', async () => {
			it('Rejects insufficient amounts', async () => {
				const invalidAmount = tokens(100000000);

				await token
					.transferFrom(deployer, receiver, invalidAmount, {from: exchange})
					.should.be.rejectedWith(EVM_REVERT);
			});

			it('Rejects invalid recipients', async () => {
				await token.transferFrom(deployer, 0x0, amount, {from: exchange}).should.be
					.rejected;
			});
		});
	});
});
