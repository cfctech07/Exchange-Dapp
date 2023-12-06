import React, {Component} from 'react';
import {connect} from 'react-redux';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import Spinner from './Spinner';
import {
	orderBookSelector,
	orderBookLoadedSelector,
	exchangeSelector,
	accountSelector,
	orderFillingSelector,
} from '../store/selectors';
import {fillOrder} from '../store/interactions';

/*----------------Render order----------------*/

const renderOrder = (order, props) => {
	const {dispatch, exchange, account} = props;

	return (
		<OverlayTrigger
			key={order.id}
			placement='auto'
			overlay={
				<Tooltip id={order.id}>
					{' '}
					{`Click here to ${order.orderFillAction} tokens`}{' '}
				</Tooltip>
			}>
			<tr
				key={order.id}
				className='order-book-order'
				onClick={(e) => fillOrder(dispatch, exchange, order, account)}>
				<td className='text-center'>{order.tokenAmount}</td>
				<td className={`text-${order.orderTypeClass} text-center`}>{order.tokenPrice}</td>
				<td className='text-center'>{order.etherAmount}</td>
			</tr>
		</OverlayTrigger>
	);
};

/*----------------Show order book----------------*/

const showOrderBook = (props) => {
	const {orderBook} = props;

	return (
		<tbody>
			{orderBook.sellOrders.map((order) => renderOrder(order, props))}
			<tr className='text-center bg-secondary'>
				<th>XTK</th>
				<th>XTK/ETH</th>
				<th>ETH</th>
			</tr>
			{orderBook.buyOrders.map((order) => renderOrder(order, props))}
		</tbody>
	);
};

/*------------------Order book------------------------*/

class OrderBook extends Component {
	render() {
		return (
			<div className='vertical'>
				<div className='card bg-dark text-white'>
					<div className='card-header text-center font-weight-bold'>Order Book</div>
					<div className='card-body order-book'>
						<table className='table table-dark table-sm small'>
							<thead className='text-center'>
								<tr>
									<th>Amount</th>
									<th>Token price</th>
									<th>TOTAL</th>
								</tr>
							</thead>
							{this.props.showOrderBook ? (
								showOrderBook(this.props)
							) : (
								<Spinner type='table' />
							)}
						</table>
					</div>
				</div>
			</div>
		);
	}
}

/*------------------State to props---------------------*/

function mapStateToProps(state) {
	const orderBookLoaded = orderBookLoadedSelector(state);
	const orderFilling = orderFillingSelector(state);

	return {
		orderBook: orderBookSelector(state),
		showOrderBook: orderBookLoaded && !orderFilling,
		exchange: exchangeSelector(state),
		account: accountSelector(state),
	};
}

export default connect(mapStateToProps)(OrderBook);
