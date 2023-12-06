import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Tabs, Tab} from 'react-bootstrap';
import Spinner from './Spinner';
import {
	myFilledOrdersLoadedSelector,
	myFilledOrdersSelector,
	myOpenOrdersLoadedSelector,
	myOpenOrdersSelector,
	exchangeSelector,
	accountSelector,
	orderCancellingSelector,
} from '../store/selectors';
import {cancelOrder} from '../store/interactions';

/*---------------Show filled orders---------------------*/

const showMyFilledOrders = (props) => {
	const {myFilledOrders} = props;

	return (
		<tbody>
			{myFilledOrders.map((order) => {
				return (
					<tr key={order.id}>
						<td className='text-muted text-center'>{order.formattedTimestamp}</td>
						<td className={`text-${order.orderTypeClass} text-center`}>
							{order.orderSign}
							{order.tokenAmount}
						</td>
						<td className={`text-${order.orderTypeClass} text-center`}>
							{order.tokenPrice}
						</td>
					</tr>
				);
			})}
		</tbody>
	);
};

/*---------------Show my open orders---------------------*/

const showMyOpenOrders = (props) => {
	const {myOpenOrders, dispatch, exchange, account} = props;

	return (
		<tbody>
			{myOpenOrders.map((order) => {
				return (
					<tr key={order.id}>
						<td className={`text-${order.orderTypeClass} text-center`}>
							{order.tokenAmount}
						</td>
						<td className={`text-${order.orderTypeClass} text-center`}>
							{order.tokenPrice}
						</td>
						<td
							className='text-muted cancel-order text-center font-weight-bold'
							onClick={(e) => {
								cancelOrder(dispatch, exchange, order, account);
							}}>
							X
						</td>
					</tr>
				);
			})}
		</tbody>
	);
};

/*--------------------------------------------------------------*/

class MyTransactions extends Component {
	render() {
		return (
			<div className='card bg-dark text-white'>
				<div className='card-header text-center font-weight-bold'>My Transactions</div>
				<div className='card-body'>
					<Tabs fill defaultActiveKey='orders' className='bg-dark text-white'>
						<Tab eventKey='orders' title='My Open Orders'>
							<table className='table table-dark table-sm small'>
								<thead>
									<tr className='text-center small'>
										<th>Amount</th>
										<th>XTK/ETH</th>
										<th>Cancel</th>
									</tr>
								</thead>
								{this.props.showMyOpenOrders ? (
									showMyOpenOrders(this.props)
								) : (
									<Spinner type='table' />
								)}
							</table>
						</Tab>
						<Tab eventKey='trades' title='My Trades' className='bg-dark'>
							<table className='table table-dark table-sm small'>
								<thead>
									<tr className='text-center small'>
										<th>Time</th>
										<th>XTK</th>
										<th>XTK/ETH</th>
									</tr>
								</thead>
								{this.props.showMyFilledOrders ? (
									showMyFilledOrders(this.props)
								) : (
									<Spinner type='table' />
								)}
							</table>
						</Tab>
					</Tabs>
				</div>
			</div>
		);
	}
}

/*--------------------------------------------------------------*/

function mapStateToProps(state) {
	const myOpenOrdersLoaded = myOpenOrdersLoadedSelector(state);
	const orderCancelling = orderCancellingSelector(state);

	return {
		myFilledOrders: myFilledOrdersSelector(state),
		showMyFilledOrders: myFilledOrdersLoadedSelector(state),
		myOpenOrders: myOpenOrdersSelector(state),
		showMyOpenOrders: myOpenOrdersLoaded && !orderCancelling,
		exchange: exchangeSelector(state),
		account: accountSelector(state),
	};
}

export default connect(mapStateToProps)(MyTransactions);
