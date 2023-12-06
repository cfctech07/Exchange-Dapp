// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }
    address public feeAccount;
    uint256 public feePercent;
    address internal constant ETHER = address(0);

    // token address => deposit user address => number of tokens
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;
    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // receive() external payable {
    //     assert(false);
    // }

    // fallback() external payable {
    //     assert(false);
    // }

    /*-----------------Deposit/Withdraw ether-------------------*/

    function depositEther() external payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] + (msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) external {
        if (tokens[ETHER][msg.sender] < _amount) revert();
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] - (_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    /*-----------------Deposit/Withdraw token-------------------*/

    function depositToken(address _token, uint256 _amount) external {
        require(_token != ETHER);
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + (_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) external {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - (_amount);
        require(IERC20(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) external {
        ++orderCount;
        orders[orderCount] = _Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) external {
        // Fetch order from mapping abnd assign it to Order
        _Order storage order = orders[_id];
        require(address(order.user) == msg.sender, "Only owner can cancel the order");
        require(order.id == _id);

        orderCancelled[_id] = true;
        emit Cancel(
            order.id,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            block.timestamp
        );
    }

    function fillOrder(uint256 _id) external {
        require(_id > 0 && _id <= orderCount, "Line 1");
        require(!orderFilled[_id]);
        require(!orderCancelled[_id]);

        // fetch the order from storage
        _Order storage order = orders[_id];
        _trade(order.id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive);
        orderFilled[order.id] = true;
    }

    function balanceOf(address _token, address _user) external view returns (uint256) {
        return tokens[_token][_user];
    }

    function _trade(
        uint256 orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // Fee paid by the user that fills the order (msg.sender). Deducted from _amountGet
        uint256 _feeAmount = (_amountGet * (feePercent)) / (100);

        // Execute trade
        // Get sender balance and substract the amount get (including fees)
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + (_feeAmount));

        // Get the user balance and add the previous value
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + (_amountGet);

        // Add feeAmount to the feeAccount
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + (_feeAmount);

        // Get user balance and substract the amount get
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - (_amountGive);

        // Get the sender balance and add the previous value
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + (_amountGive);

        emit Trade(orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, block.timestamp);
    }
}
