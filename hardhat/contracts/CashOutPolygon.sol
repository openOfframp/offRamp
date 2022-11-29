// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CashOutPolygon is
    ERC2771Context,
    Pausable,
    Ownable,
    AutomationCompatibleInterface
{
    event TokenFundsDeposited(
        address indexed tokenDeposited,
        address indexed addressDeposited,
        uint256 amountDeposited
    );
    event TokenFundsWithdrawn(
        address indexed tokenWithdrawn,
        address indexed withdrawAddress,
        uint256 amountWithdrawn
    );
    event FundsWithdrawn(
        address indexed withdrawAddressNative,
        uint256 amountWithdrawnNative
    );
    event UniqueTokenAdded(address indexed addedToken);
    event contractTokenBalanceAdjusted(address indexed token, uint256 amount);
    uint256 minimumDepositAmount;
    uint256 maximumDepositAmount;
    uint256 triggerWithdrawAmount;
    address[] public allowedTokensAddresses;
    mapping(address => uint256) public contractTokenBalances;
    mapping(address => bool) public tokenIsAllowed;
    mapping(address => bool) public tokenTriggerAmountReached;
    mapping(address => address) public tokenPriceFeed;

    constructor(
        MinimalForwarder forwarder // Initialize trusted forwarder
    ) ERC2771Context(address(forwarder)) {
        minimumDepositAmount = 10;
        maximumDepositAmount = 1000;
        triggerWithdrawAmount = 50;
    }

    function getAddressLength() public view returns (uint256) {
        return allowedTokensAddresses.length;
    }

    function setMinimumDepositAmount(uint256 _amount) public onlyOwner {
        minimumDepositAmount = _amount;
    }

    function setMaximumDepositAmount(uint256 _amount)
        public
        whenNotPaused
        onlyOwner
    {
        maximumDepositAmount = _amount;
    }

    function setTriggerWithdrawAmount(uint256 _amount)
        public
        whenNotPaused
        onlyOwner
    {
        triggerWithdrawAmount = _amount;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    receive() external payable {}

    fallback() external payable {}

    function addAllowedToken(address _token, address _priceFeedAddress)
        public
        onlyOwner
    {
        require(!tokenIsAllowed[_token], "token Already Exists");
        allowedTokensAddresses.push(_token);
        tokenIsAllowed[_token] = true;
        tokenTriggerAmountReached[_token] = false;
        tokenPriceFeed[_token] = _priceFeedAddress;
        emit UniqueTokenAdded(_token);
    }

    function getLatestPrice(address _token) public view returns (uint256) {
        address _priceFeed = tokenPriceFeed[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_priceFeed);
        (, int256 price, , , ) = priceFeed.latestRoundData();

        return uint256(price);
    }

    function minimumTokenDepositAmount(address _token)
        public
        view
        returns (uint256)
    {
        uint256 price = getLatestPrice(_token);
        // the price is scale up by 10**8
        uint256 tokenAmount = (minimumDepositAmount * 1e26) / price;
        return tokenAmount;
    }

    function maximumTokenDepositAmount(address _token)
        public
        view
        returns (uint256)
    {
        uint256 price = getLatestPrice(_token);
        uint256 tokenAmount = (maximumDepositAmount * 1e26) / price;
        return tokenAmount;
    }

    function triggerTokenWithdrawAmount(address _token)
        public
        view
        returns (uint256)
    {
        uint256 price = getLatestPrice(_token);
        uint256 tokenAmount = (triggerWithdrawAmount * 1e26) / price;
        return tokenAmount;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        whenNotPaused
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // first number of tokens requiring upkeep
        uint256 counter;
        for (uint256 i = 0; i < allowedTokensAddresses.length; i++) {
            address token = allowedTokensAddresses[i];
            if (
                contractTokenBalances[token] > triggerTokenWithdrawAmount(token)
            ) {
                counter++;
            }
        }
        // initialize an array tokenAddress requiring upkeep
        address[] memory tokens = new address[](counter);
        upkeepNeeded = false;
        uint256 indexCounter;
        for (uint256 i = 0; i < allowedTokensAddresses.length; i++) {
            address token = allowedTokensAddresses[i];
            require(
                tokenTriggerAmountReached[token] == false,
                "token has not been withdrawn yet"
            );
            if (
                contractTokenBalances[token] > triggerTokenWithdrawAmount(token)
            ) {
                upkeepNeeded = true;
                // store the index of the token which needs to be withdrawn
                tokens[indexCounter] = token;
                indexCounter++;
            }
        }
        performData = abi.encode(tokens);
        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData)
        external
        override
        whenNotPaused
    {
        address[] memory tokens = abi.decode(performData, (address[]));
        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            require(
                contractTokenBalances[token] >
                    triggerTokenWithdrawAmount(token),
                "Token hasn't reached trigger amount"
            );
            require(
                tokenTriggerAmountReached[token] == false,
                "token has not been withdrawn yet"
            );
            tokenTriggerAmountReached[token] = true;
        }
    }

    function depositToken(address _token, uint256 _amount) public {
        require(tokenIsAllowed[_token], "the token is not currently allowed");
        require(
            _amount >= minimumTokenDepositAmount(_token),
            "amount less than minimum allowed withdraw"
        );
        require(
            _amount <= maximumTokenDepositAmount(_token),
            "amount more than maximum allowed withdraw"
        );
        IERC20(_token).transferFrom(_msgSender(), address(this), _amount);
        uint256 contractTokenBalance = contractTokenBalances[_token] += _amount;
        emit contractTokenBalanceAdjusted(_token, contractTokenBalance);
        emit TokenFundsDeposited(_token, _msgSender(), _amount);
    }

    function depositWithPermit(
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(tokenIsAllowed[token], "the token is not currently allowed");
        IERC20Permit(token).permit(
            _msgSender(),
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );
        IERC20(token).transferFrom(_msgSender(), address(this), amount);
        uint256 contractTokenBalance = contractTokenBalances[token] += amount;
        emit contractTokenBalanceAdjusted(token, contractTokenBalance);
        emit TokenFundsDeposited(token, _msgSender(), amount);
    }

    function withdrawToken(address _withdrawerAddress, address _token)
        public
        onlyOwner
        whenNotPaused
    {
        require(tokenIsAllowed[_token], "the token is currently not allowed");
        require(
            IERC20(_token).balanceOf(address(this)) >= 0,
            "insufficient tokens available in the contract"
        );
        uint256 _amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(_withdrawerAddress, _amount);
        uint256 contractTokenBalance = contractTokenBalances[_token] = 0;
        tokenTriggerAmountReached[_token] = false;
        emit contractTokenBalanceAdjusted(_token, contractTokenBalance);
        emit TokenFundsWithdrawn(_token, _withdrawerAddress, _amount);
    }

    function withdrawCoin(address _withdrawerAddress)
        public
        payable
        onlyOwner
        whenNotPaused
    {
        uint256 _amount = address(this).balance;
        (bool success, ) = payable(_withdrawerAddress).call{value: _amount}("");
        require(success, "Failed to withdraw coin to address");
        emit FundsWithdrawn(_withdrawerAddress, _amount);
    }

    function _msgSender()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (address sender)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
