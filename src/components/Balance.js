import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Tabs, Tab} from 'react-bootstrap';
import Spinner from './Spinner';
import {
	loadBalances,
	depositEther,
	depositToken,
	withdrawEther,
	withdrawToken,
} from '../store/interactions';
import {
	exchangeSelector,
	tokenSelector,
	accountSelector,
	web3Selector,
	etherBalanceSelector,
	tokenBalanceSelector,
	exchangeEtherBalanceSelector,
	exchangeTokenBalanceSelector,
	balancesLoadingSelector,
	etherDepositAmountSelector,
	etherWithdrawAmountSelector,
	tokenDepositAmountSelector,
	tokenWithdrawAmountSelector,
} from '../store/selectors';
import {
	etherDepositAmountChanged,
	etherWithdrawAmountChanged,
	tokenDepositAmountChanged,
	tokenWithdrawAmountChanged,
} from '../store/actions';

/*-------------------------------------------*/

const showForm = (props) => {
	const {
		dispatch,
		web3,
		account,
		token,
		exchange,
		etherBalance,
		tokenBalance,
		exchangeEtherBalance,
		exchangeTokenBalance,
		etherDepositAmount,
		tokenDepositAmount,
		etherWithdrawAmount,
		tokenWithdrawAmount,
	} = props;

	return (
		<Tabs fill defaultActiveKey='deposit' className='bg-dark text-white'>
			{/*--------------------DEPOSIT TAB STARTS----------------------------*/}
			<Tab eventKey='deposit' title='Deposit' className='bg-dark'>
				<table className='table table-dark table-sm  text-center balance-table'>
					<thead className='bg-secondary '>
						<tr>
							<th>Token</th>
							<th>My Wallet</th>
							<th>Exchange</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='font-italic font-weight-bold'>ETH</td>
							<td>{etherBalance}</td>
							<td>{exchangeEtherBalance}</td>
						</tr>
					</tbody>
					<tbody>
						<tr>
							<td className='font-italic font-weight-bold'>XTK</td>
							<td>{tokenBalance}</td>
							<td>{exchangeTokenBalance}</td>
						</tr>
					</tbody>
				</table>
				{/*------------------Deposit ETH starts------------------------*/}
				<form
					className='row py-4'
					onSubmit={(event) => {
						event.preventDefault();
						depositEther(dispatch, exchange, web3, etherDepositAmount, account);
					}}>
					<div className='col-12 col-sm pr-sm-2'>
						<input
							type='text'
							placeholder='ETH amount'
							onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))}
							className='form-control form-control-sm bg-dark text-white'
							required
						/>
					</div>
					<div className='col-12 col-sm-auto pl-sm-0'>
						<button type='submit' className='btn btn-primary btn-block btn-sm'>
							Deposit ETH
						</button>
					</div>
				</form>
				{/*------------------Deposit ETH ends------------------------*/}
				{/*------------------Deposit XTK starts------------------------*/}
				<form
					className='row'
					onSubmit={(event) => {
						event.preventDefault();
						depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account);
					}}>
					<div className='col-12 col-sm pr-sm-2'>
						<input
							type='text'
							placeholder='XTK amount'
							onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))}
							className='form-control form-control-sm bg-dark text-white'
							required
						/>
					</div>
					<div className='col-12 col-sm-auto pl-sm-0'>
						<button type='submit' className='btn btn-primary btn-block btn-sm'>
							Deposit XTK
						</button>
					</div>
				</form>
				{/*------------------Deposit XTK ends------------------------*/}
			</Tab>
			{/*--------------------DEPOSIT TAB ENDS----------------------------*/}
			{/*--------------------WITHDRAW TAB STARTS----------------------------*/}
			<Tab eventKey='withdraw' title='Withdraw' className='bg-dark'>
				<table className='table table-dark table-sm text-center balance-table'>
					<thead className='bg-secondary'>
						<tr>
							<th>Token</th>
							<th>My Wallet</th>
							<th>Exchange</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='font-italic font-weight-bold'>ETH</td>
							<td>{etherBalance}</td>
							<td>{exchangeEtherBalance}</td>
						</tr>
					</tbody>
					<tbody>
						<tr>
							<td className='font-italic font-weight-bold'>XTK</td>
							<td>{tokenBalance}</td>
							<td>{exchangeTokenBalance}</td>
						</tr>
					</tbody>
				</table>
				{/*-----------------Withdraw ETH starts--------------------------*/}
				<form
					className='row py-4'
					onSubmit={(event) => {
						event.preventDefault();
						withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account);
					}}>
					<div className='col-12 col-sm pr-sm-2'>
						<input
							type='text'
							placeholder='ETH amount'
							onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value))}
							className='form-control form-control-sm bg-dark text-white'
							required
						/>
					</div>
					<div className='col-12 col-sm-auto pl-sm-0'>
						<button type='submit' className='btn btn-primary btn-block btn-sm'>
							Withdraw ETH
						</button>
					</div>
				</form>
				{/*-----------------Withdraw ETH ends--------------------------*/}
				{/*-----------------Withdraw token starts--------------------------*/}
				<form
					className='row'
					onSubmit={(event) => {
						event.preventDefault();
						withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account);
					}}>
					<div className='col-12 col-sm pr-sm-2'>
						<input
							type='text'
							placeholder='XTK amount'
							onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value))}
							className='form-control form-control-sm bg-dark text-white'
							required
						/>
					</div>
					<div className='col-12 col-sm-auto pl-sm-0'>
						<button type='submit' className='btn btn-primary btn-block btn-sm'>
							Withdraw XTK
						</button>
					</div>
				</form>
				{/*-----------------Withdraw token ends--------------------------*/}
			</Tab>
			{/*--------------------WITHDRAW TAB ENDS----------------------------*/}
		</Tabs>
	);
};

/*-------------------------------------------*/

class Balance extends Component {
	componentWillMount() {
		this.loadBlockchainData();
	}

	async loadBlockchainData() {
		const {dispatch, web3, exchange, token, account} = this.props;
		await loadBalances(dispatch, web3, exchange, token, account);
	}

	render() {
		return (
			<div className='card bg-dark text-white'>
				<div className='card-header text-center font-weight-bold'>Balances</div>
				<div className='card-body'>
					{this.props.showForm ? showForm(this.props) : <Spinner />}
				</div>
			</div>
		);
	}
}

/*-------------------------------------------*/

function mapStateToProps(state) {
	const balancesLoading = balancesLoadingSelector(state);

	return {
		account: accountSelector(state),
		exchange: exchangeSelector(state),
		token: tokenSelector(state),
		web3: web3Selector(state),
		etherBalance: etherBalanceSelector(state),
		tokenBalance: tokenBalanceSelector(state),
		exchangeEtherBalance: exchangeEtherBalanceSelector(state),
		exchangeTokenBalance: exchangeTokenBalanceSelector(state),
		balancesLoading,
		showForm: !balancesLoading,
		etherDepositAmount: etherDepositAmountSelector(state),
		etherWithdrawAmount: etherWithdrawAmountSelector(state),
		tokenDepositAmount: tokenDepositAmountSelector(state),
		tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
	};
}

export default connect(mapStateToProps)(Balance);
