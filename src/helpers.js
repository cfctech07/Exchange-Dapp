export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
export const GREEN = 'success';
export const RED = 'danger';

// 18 decimal places
export const DECIMALS = 10 ** 18;

// Shortcut to avoid passing around web3 connection
export const ether = (wei) => {
	if (wei) {
		return wei / DECIMALS;
	}
};

// Tokens and ether have same decimal resolution
export const tokens = ether;

export const formatBalance = (balance) => {
	const precision = 1000;

	balance = ether(balance);
	balance = Math.round(balance * precision) / precision;

	return balance;
};
