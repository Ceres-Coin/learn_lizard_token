// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;
import "./lib/utils/TransferHelper.sol";
import "./lib/token/BEP20/IBEP20.sol";
 
contract LizMinePool
{
    address _owner;
    address _token;
    address _feeowner;
    using TransferHelper for address;
 
    constructor(address tokenaddress,address feeowner) public
    {
        _owner=msg.sender;
        _token=tokenaddress;
        _feeowner=feeowner;
    }

    function get_owner() public view returns(address) {
        return _owner;
    }
    
    function get_token() public view returns(address) {
        return _token;
    }

    function get_feeowner() public view returns(address) {
        return _feeowner;
    }

    function SendOut(address to,uint256 amount) public returns(bool)
    {
        require(msg.sender==_feeowner);
        _token.safeTransfer(to, amount);
        return true;
    }

 
    function MineOut(address to,uint256 amount,uint256 fee) public returns(bool){
        require(msg.sender==_owner);
        _token.safeTransfer(to, amount);
        _token.safeTransfer(_feeowner, fee);//get fee
        return true;
    }
}