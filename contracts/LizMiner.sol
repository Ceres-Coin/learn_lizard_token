// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

import "./lib/math/SafeMath.sol";
import "./lib/utils/ReentrancyGuard.sol";
import "./lib/utils/TransferHelper.sol";
import "./lib/token/BEP20/BEP20.sol";
import "./LizMinerDefine.sol";
import "./LpWallet.sol";
import "./LizMinePool.sol";
import "./lib/access/Ownable.sol";


interface IPancakePair {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract LizMiner is ReentrancyGuard,LizMinerDefine,Ownable {
    using TransferHelper for address;
    using SafeMath for uint256;
    address private _Lizaddr;
    address private _Liztrade;
    address private _bnbtradeaddress;
    address private _wrappedbnbaddress;
    address private _usdtaddress;
    address private _owner;
    address private _feeowner;
    LizMinePool private _minepool;

    struct PoolInfo {
        LpWallet poolwallet;
        uint256 hashrate;  //  The LP hashrate
        address tradeContract;
        uint256 totaljthash;
        uint minpct;
        uint maxpct;
    }
    // TODO: [Parameter][_levelconfig]: add test scripts
    mapping(uint=>uint256[20]) internal _levelconfig; //credit level config
    // TEST CASE DONE
    uint256[11] public _vipbuyprice =[0,100,300,500,800,1200,1600,2000,0,0,0];
    // TEST CASE DONE
    CheckPoint[] public _checkpoints;

    uint256 private _nowtotalhash;
 
    // TODO: [Parameter][_oldpool] add test scripts of _oldpool
    mapping(address=>mapping(address=>uint256)) _oldpool;
    // TODO: [Parameter][_userLphash] add test scripts of _userLphash
    mapping(address=>mapping(address=>uint256)) _userLphash;
    // TODO: [Parameter][_teamhashdetail] add test scripts of _teamhashdetail
    mapping(address=>mapping(address=>uint256)) _teamhashdetail;
    // TODO: [Parameter][_userlevelhashtotal] add test scripts of _userlevelhashtotal
    mapping(address=>mapping(uint=>uint256)) _userlevelhashtotal; 
    // TEST CASES DONE
    mapping(address=>address) public _parents;
    // TEST CASES DONE
    mapping(address=>UserInfo) _userInfos; 
    // TEST CASES DONE
    mapping(address=>PoolInfo) _lpPools;
    // TEST CASES DONE
    mapping(address=>address[]) _mychilders; 


    event BindingParents(address indexed user,address  inviter);
    event VipChanged(address indexed user,uint256  userlevel);
    event TradingPooladded(address indexed tradetoken);
    event UserBuied(address indexed tokenaddress,uint256 amount);
    event TakedBack(address indexed tokenaddress,uint256 pct);
    
    // TEST CASE DONE
    constructor() public
    {
        _owner=msg.sender;
    }
    // TEST CASE DONE
    function getMinerPoolAddress() public view returns(address)
    {
        return address(_minepool);
    }
    // TEST CASE DONE
    function getMyChilders(address user) public view returns(address[] memory)
    {
        return _mychilders[user];
    } 
    // TEST CASE DONE
    function InitalContract(address lizToken,address liztrade,address wrappedbnbaddress,address bnbtradeaddress,address usdtaddress,address feeowner) public onlyOwner
    {
        require(_checkpoints.length==0);
        _Lizaddr=lizToken;
        _Liztrade=liztrade; 
        _wrappedbnbaddress= wrappedbnbaddress; 
        _bnbtradeaddress=bnbtradeaddress; 
        _usdtaddress=usdtaddress;
        _feeowner= feeowner;

        _minepool = new LizMinePool(lizToken,feeowner);
        _parents[msg.sender] = address(_minepool);
        _checkpoints.push(CheckPoint({startblock:40000,totalhash:1}));

        _levelconfig[0] = [100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        _levelconfig[1] = [150,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        _levelconfig[2] = [160,110,90,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        _levelconfig[3] = [170,120,100,70,40,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        _levelconfig[4] = [180,130,110,80,40,30,20,10,0,0,0,0,0,0,0,0,0,0,0,0];
        _levelconfig[5] = [200,140,120,90,40,30,20,10,10,10,10,10,0,0,0,0,0,0,0,0];
        _levelconfig[6] = [220,160,140,100,40,30,20,10,10,10,10,10,10,10,10,10,0,0,0,0];
        _levelconfig[7] = [250,180,160,110,40,30,20,10,10,10,10,10,10,10,10,10,10,10,10,10];
    }

    // TEST CASE DONE
    function fixTradingPool(address tokenAddress,address tradecontract,uint256 rate,uint pctmin,uint pctmax) public onlyOwner returns (bool) 
    {
        
        _lpPools[tokenAddress].tradeContract=tradecontract;
        _lpPools[tokenAddress].hashrate=rate;
        _lpPools[tokenAddress].minpct=pctmin;
        _lpPools[tokenAddress].maxpct=pctmax;
        return true;
    }
 
    // TEST CASE DONE
    function addTradingPool(address tokenAddress,address tradecontract,uint256 rate,uint pctmin,uint pctmax) public onlyOwner returns (bool) 
    {
        
        require(rate > 0,"ERROR RATE");
        require(_lpPools[tokenAddress].hashrate==0,"LP EXISTS");
 
        LpWallet wallet = new LpWallet(tokenAddress,_Lizaddr,_feeowner);
        _lpPools[tokenAddress] = PoolInfo({
         poolwallet:wallet,
         hashrate:rate,
         tradeContract:tradecontract,
         totaljthash:0,
         minpct:pctmin,
         maxpct:pctmax
        });
        emit TradingPooladded(tokenAddress);
        return true;
    }

     //******************Getters ******************/
    // TEST CASE DONE    
    function getOwner() public view returns(address) {
        return _owner;
    }

    // TEST CASE DONE
    function getParent(address user) public view returns(address)
    {
        return _parents[user];
    }

    // TEST CASE DONE
    function CurrentBlockReward() public view returns (uint256)
    {
        return OneBlockReward(_nowtotalhash);
    }

    // TEST CASE DONE
    function OneBlockReward(uint256 totalhash) public pure returns (uint256)
    {
        if(totalhash < 10000000 * 1000000000000000000)
            return  totalhash.div(100000000000000000);
        else
            return 100000000;
    }

    // TEST CASE DONE
    function getTotalHash() public view returns (uint256)
    {
         return _nowtotalhash;
    }

    // TEST CASE DONE
     function getPoolTotal(address tokenaddress) public view returns (uint256)
     {
         return _lpPools[tokenaddress].totaljthash;
     }

    // TODO: [func][getPoolInfo] add test scripts of getPoolInfo()
     function getPoolInfo(address tokenAddress) public view returns(PoolInfo memory)
     {
         return _lpPools[tokenAddress];
     }
 
    // TEST CASE DONE
     function getMyLpInfo(address user,address tokenaddress) public view returns (uint256[3] memory )
     {
         uint256[3] memory bb;
         bb[0]= _lpPools[tokenaddress].poolwallet.getBalance(user,true);
         bb[1]= _lpPools[tokenaddress].poolwallet.getBalance(user,false);
         bb[2]= _userLphash[user][tokenaddress];
         return bb;
     }

    // TEST CASE DONE
     function getUserLevel(address user) public view returns (uint)
    {
        return _userInfos[user].userlevel;
    }

    // TEST CASE DONE
    function getUserTeamHash(address user) public view returns (uint256)
    {
        return _userInfos[user].teamhash;
    }
 
    // TEST CASE DONE
    function getUserSelfHash(address user) public view returns (uint256)
    {
        return _userInfos[user].selfhash;
    }

    // TEST CASE DONE
    function getFeeOnwer() public view returns (address)
    {
        return _feeowner;
    }
  
    // TEST CASE DONE
    function getExchangeCountOfOneUsdt(address lptoken) public view returns (uint256)
    {
        require(_lpPools[lptoken].tradeContract !=address(0));

        if(lptoken == address(2))//BNB
        {

            (uint112 _reserve0, uint112 _reserve1,) = IPancakePair(_bnbtradeaddress).getReserves();
            uint256 a=_reserve0;
            uint256 b = _reserve1;
            return b.mul(1000000000000000000).div(a);
        }

        if(lptoken==_Lizaddr)
        {
            (uint112 _reserve0, uint112 _reserve1,) = IPancakePair(_Liztrade).getReserves();
            uint256 a=_reserve0;
            uint256 b = _reserve1;
            return b.mul(1000000000000000000).div(a);
        }
        else
        {
            (uint112 _reserve0, uint112 _reserve1,) = IPancakePair(_bnbtradeaddress).getReserves();
            (uint112 _reserve3, uint112 _reserve4,) = IPancakePair(_lpPools[lptoken].tradeContract).getReserves();

            uint256 balancea= _reserve0; 
            uint256 balanceb = _reserve1;
            uint256 balancec= IPancakePair(_lpPools[lptoken].tradeContract).token0() == lptoken?_reserve3:_reserve4; 
            uint256 balanced=IPancakePair(_lpPools[lptoken].tradeContract).token0() == lptoken?_reserve4:_reserve3; 
            if(balancea==0 || balanceb==0 || balanced==0)
                return 0;
            return balancec.mul(1000000000000000000).div(balancea.mul(balanced).div(balanceb));
            
        }
    }

    // TEST CASE DONE
    function buyVipPrice(address user,uint newlevel) public view returns (uint256)
    {
        if(newlevel>=8)
            return 0;

        uint256 userlevel=_userInfos[user].userlevel;
        if(userlevel >= newlevel)
            return 0;
        uint256 costprice=_vipbuyprice[newlevel] - _vipbuyprice[userlevel];
        uint256 costcount=costprice.mul(getExchangeCountOfOneUsdt(_Lizaddr)); 
        return costcount;
    }
  
    //******************Getters ************************************/
    // TEST CASE DONE
    function getWalletAddress(address lptoken) public view returns (address)
    {
        return address(_lpPools[lptoken].poolwallet);
    }

    // NOTHING TO DO PRIVATE
    function logCheckPoint(uint256 totalhashdiff,bool add,uint256 blocknumber) private
    {
        if(add)
        {
            _nowtotalhash= _nowtotalhash.add(totalhashdiff);
        }
        else
        {
            _nowtotalhash= _nowtotalhash.sub(totalhashdiff);
        }
 
        if(_checkpoints.length > 0)
        {
            if(blocknumber >_checkpoints[_checkpoints.length -1].startblock)
               _checkpoints.push(CheckPoint({startblock:blocknumber,totalhash:_nowtotalhash}));
            else
            {
                _checkpoints[_checkpoints.length -1].totalhash = _nowtotalhash;
            }   
        }
        else
        {
            _checkpoints.push(CheckPoint({startblock:blocknumber,totalhash:_nowtotalhash}));
        }
    }

    // NOTHING TO DO PRIVATE
    function getHashDiffOnLevelChange(address user,uint newlevel) private view returns (uint256)
    {
         uint256 hashdiff=0;
        uint userlevel = _userInfos[user].userlevel;
        for(uint i=0;i<20;i++) 
        {
            if(_userlevelhashtotal[user][i] > 0)
            {
                if(_levelconfig[userlevel][i] >0)
                {
                    uint256 dff=_userlevelhashtotal[user][i].mul(_levelconfig[newlevel][i]).div(_levelconfig[userlevel][i]);
                    hashdiff = hashdiff.add(dff);
                }
                else
                {
                    uint256 dff=_userlevelhashtotal[user][i].mul(_levelconfig[newlevel][i]).div(1000);
                    hashdiff = hashdiff.add(dff);
                }
            } 
        }
        return hashdiff;
    }

    // TEST CASE DONE
    function SetUserLevel(address user,uint level)  public onlyOwner
    {
        _userInfos[user].userlevel=level;

    }

    // TODO: [func][ChangeWithDrawPoint] add test cases of ChangeWithDrawPoint
    function ChangeWithDrawPoint(address user,uint256 blocknum,uint256 pendingreward) public onlyOwner
    {
         _userInfos[user].pendingreward=pendingreward;
        _userInfos[user].lastblock=blocknum;
        _userInfos[user].lastcheckpoint= _checkpoints.length -1;
    }
    
    // TODO: [func][AddUserTrading] add test cases for AddUserTrading
    function AddUserTrading(address tokenAddress,address useraddress,uint256 amounta,uint256 amountb,uint256 addhash,uint256 startblock) public onlyOwner
    {
        require(startblock >= _checkpoints[_checkpoints.length -1].startblock);
        _lpPools[tokenAddress].poolwallet.addBalance(useraddress,amounta,amountb);
        _lpPools[tokenAddress].totaljthash= _lpPools[tokenAddress].totaljthash.add(addhash);
        _userLphash[useraddress][tokenAddress] = _userLphash[useraddress][tokenAddress].add(addhash);
        _oldpool[useraddress][tokenAddress] = _oldpool[useraddress][tokenAddress].add(amounta);
   
        address parent=useraddress;
        uint256 dhash=0;

        for(uint i=0;i<20;i++)
        {
            parent = _parents[parent];
            if(parent==address(0))
                break;
            _teamhashdetail[parent][useraddress] = _teamhashdetail[parent][useraddress].add(addhash);
            _userlevelhashtotal[parent][i]= _userlevelhashtotal[parent][i].add(addhash);
            uint256 parentlevel= _userInfos[parent].userlevel;
            if(_levelconfig[parentlevel][i] > 0)
            {
                uint256 teamhash= addhash.mul(_levelconfig[parentlevel][i]).div(1000);
                if(teamhash > 0)
                {
                    dhash=dhash.add(teamhash);
                    UserHashChanged(parent,0,teamhash,true,startblock);
                }
            }
        }
        UserHashChanged(useraddress,addhash,0,true,startblock);
        logCheckPoint(addhash.add(dhash),true,startblock);
    }
 
    // TEST CASE DONE
    function buyVip(uint newlevel) public nonReentrant returns (bool)
    {
        require(newlevel<8);
        require(_parents[msg.sender] !=address(0),"err");
        uint256 costcount=buyVipPrice(msg.sender,newlevel);
        require(costcount>0);
        uint256 diff=getHashDiffOnLevelChange(msg.sender,newlevel);
        if(diff >0)
        {
            UserHashChanged(msg.sender,0,diff,true,block.number);
            logCheckPoint(diff,true,block.number);
        }

        BEP20(_Lizaddr).burnFrom(msg.sender, costcount); 
        _userInfos[msg.sender].userlevel=newlevel;
        emit VipChanged(msg.sender,newlevel);
        return true;
    }
    // TEST CASE DONE
    function getBalanceIBEP20() public view returns (uint256)
    {
        return IBEP20(_Lizaddr).balanceOf(msg.sender);
    }

    // TEST CASE DONE
    function bindParent(address parent) public 
    {
        require(_parents[msg.sender]==address(0),"Already bind");
        require(parent !=address(0),"ERROR parent");
        require(parent !=msg.sender,"error parent");
        require(_parents[parent]!=address(0));
        _parents[msg.sender]=parent;
        _mychilders[parent].push(msg.sender);
        emit BindingParents(msg.sender,parent);
    }

    // TEST CASE DONE
    function SetParentByAdmin(address user,address parent) public onlyOwner
    {
        
         _parents[user]=parent;
         _mychilders[parent].push(user);
    }
    
    // TEST CASE DONE
    function  getPendingCoin(address user) public view returns(uint256)
    {
        if(_userInfos[user].lastblock==0)
        {
            return 0;
        }
        uint256 total= _userInfos[user].pendingreward;
        uint256 lastblock = _userInfos[user].lastblock;
        uint256 mytotalhash=_userInfos[user].selfhash.add(_userInfos[user].teamhash);

        for(uint i= _userInfos[user].lastcheckpoint + 1;i<_checkpoints.length;i++ )
        {
            uint256 blockcount = _checkpoints[i].startblock-lastblock;
            uint256 oneblock = OneBlockReward(_checkpoints[i -1].totalhash );
            if(_checkpoints[i -1].totalhash >0)
            {
                uint256 get= blockcount.mul(oneblock).mul(mytotalhash).div(_checkpoints[i -1].totalhash);
                total = total.add(get);
            }
            
            lastblock= _checkpoints[i].startblock;
        }

        if(lastblock < block.number)
        {
            uint256 blockcount = block.number-lastblock;
            uint256 oneblock = OneBlockReward(_nowtotalhash);
            if(_nowtotalhash > 0)
            {
                uint256 get= blockcount.mul(oneblock).mul(mytotalhash).div(_nowtotalhash);
                total = total.add(get);
            }
        }
        return total;
    }
    // NOTHING TO DO
    function UserHashChanged(address user,uint256 selfhash,uint256 teamhash,bool add,uint256 blocknum) private
    {
        UserInfo memory info = _userInfos[user];
        info.pendingreward= getPendingCoin(user);
        info.lastblock=blocknum;
        info.lastcheckpoint=_checkpoints.length -1;
        if(selfhash >0)
        {
            if(add)
            {
                info.selfhash= info.selfhash.add(selfhash);
            }
            else
                info.selfhash= info.selfhash.sub(selfhash);
        }
        if(teamhash > 0)
        {
            if(add)
            {
                info.teamhash= info.teamhash.add(teamhash);
            }
            else
                info.teamhash= info.teamhash.sub(teamhash);

        }
        _userInfos[user]=info;
    }

    // TEST CASE DONE
    function WithDrawCredit() public nonReentrant returns (bool)
    {
        uint256 amount = getPendingCoin(msg.sender);
        if(amount < 100) 
            return true;
        _userInfos[msg.sender].pendingreward=0;
        _userInfos[msg.sender].lastblock=block.number;
        _userInfos[msg.sender].lastcheckpoint= _checkpoints.length -1;
        uint256 fee= amount.div(100);
        _minepool.MineOut(msg.sender, amount.sub(fee),fee);
        return true;
    }
    // TODO: [func][TakeBack] ADD TEST SCRIPTS OF TakeBack() func
    function TakeBack(address tokenAddress,uint256 pct) public nonReentrant returns (bool)
    {
        require(pct >=10000 &&pct <=1000000);
        require(_lpPools[tokenAddress].poolwallet.getBalance(msg.sender,true) >= 10000,"ERROR AMOUNT");
        require(_oldpool[msg.sender][tokenAddress] ==0,"back old");
        uint256 balancea=_lpPools[tokenAddress].poolwallet.getBalance(msg.sender,true);
        uint256 balanceb=_lpPools[tokenAddress].poolwallet.getBalance(msg.sender,false);
        uint256 totalhash=_userLphash[msg.sender][tokenAddress];
 
        uint256 amounta= balancea.mul(pct).div(1000000);
        uint256 amountb= balanceb.mul(pct).div(1000000);
        uint256 decreasehash= _userLphash[msg.sender][tokenAddress].mul(pct).div(1000000);

         if(balanceb.sub(amountb) <= 10000)
        {
            decreasehash=totalhash;
            amounta=balancea;
            amountb=balanceb;
            _userLphash[msg.sender][tokenAddress]=0;
 
        }else
        {
            _userLphash[msg.sender][tokenAddress]= totalhash.sub(decreasehash);
        }

        _lpPools[tokenAddress].totaljthash= _lpPools[tokenAddress].totaljthash.sub(decreasehash);
       
        address parent=msg.sender;
        uint256 dthash=0;
        for(uint i=0;i<20;i++)
        {
            parent = _parents[parent];
            if(parent==address(0))
                break;
            uint256 basehash= decreasehash;
            if(_teamhashdetail[parent][msg.sender] < basehash)
                basehash= _teamhashdetail[parent][msg.sender];

             _teamhashdetail[parent][msg.sender]= _teamhashdetail[parent][msg.sender].sub(basehash);

            _userlevelhashtotal[parent][i]= _userlevelhashtotal[parent][i].sub(basehash);
            uint256 parentlevel= _userInfos[parent].userlevel;
            uint256 pdechash= basehash.mul(_levelconfig[parentlevel][i]).div(1000);
            if(pdechash > 0)
            {
                dthash=dthash.add(pdechash);
                UserHashChanged(parent,0,pdechash,false,block.number);
            } 
        }
        UserHashChanged(msg.sender,decreasehash,0,false,block.number);
        logCheckPoint(decreasehash.add(dthash),false,block.number);
        _lpPools[tokenAddress].poolwallet.TakeBack(msg.sender,amounta,amountb);
        if(tokenAddress==address(2))
        {
            uint256 fee2= amounta.div(100);
           (bool success, ) = msg.sender.call{value: amounta.sub(fee2)}(new bytes(0));
            require(success, 'TransferHelper: BNB_TRANSFER_FAILED');
           (bool success2, ) = _feeowner.call{value: fee2}(new bytes(0));
           require(success2, 'TransferHelper: BNB_TRANSFER_FAILED');
            if(amountb>=100)
           {
               uint256 fee = amountb.div(100);//Destory 1%
               _Lizaddr.safeTransfer(msg.sender, amountb.sub(fee));
            //    IBEP20(_Lizaddr).burn(fee);
                BEP20(_Lizaddr).burn(fee);
           }
           else
           {
               _Lizaddr.safeTransfer(msg.sender, amountb);
           }
        }
        emit TakedBack(tokenAddress,pct);
        return true;
    }

    // TODO: [func][getPower] add test scripts of getPower()
    function getPower(address tokenAddress,uint256 amount,uint lpscale) public view returns (uint256)
    {
        uint256 hashb= amount.mul(1000000000000000000).mul(100).div(lpscale).div(getExchangeCountOfOneUsdt(tokenAddress));
        return hashb;
    }

    // TODO: [func][getLpPayLiz] add test scripts of getLpPayLiz()
    function getLpPayLiz(address tokenAddress,uint256 amount,uint lpscale) public view returns (uint256)
    {
        require(lpscale<=100);
        uint256 hashb= amount.mul(1000000000000000000).mul(100).div(lpscale).div(getExchangeCountOfOneUsdt(tokenAddress));
        uint256 costabc =  hashb.mul(getExchangeCountOfOneUsdt(_Lizaddr)).mul(100 - lpscale).div(1000000000000000000 * 100);
        return costabc;
    }
 
    // TODO: [func][deposit] add test scripts of deposit()
    function deposit(address tokenAddress,uint256 amount,uint dppct) public nonReentrant payable returns (bool)  
    {
        if(tokenAddress==address(2))
        {
            amount = msg.value;
        }
        require(amount > 10000); 
        require(dppct>= _lpPools[tokenAddress].minpct && dppct <= _lpPools[tokenAddress].maxpct,"Invalid Pct");
        uint256 hashb= getPower(tokenAddress,amount,dppct);
        uint256 costliz =  hashb.mul(getExchangeCountOfOneUsdt(_Lizaddr)).mul(100 - dppct).div(1000000000000000000 * 100);
        uint256 abcbalance=IBEP20(_Lizaddr).balanceOf(msg.sender);
		
		
        if(abcbalance < costliz)
        {
			require(tokenAddress!=address(2),"Not enough liz balance");
            amount = amount.mul(abcbalance).div(costliz);
            hashb= hashb.mul(abcbalance).div(costliz);
            costliz= abcbalance;
        }
 
        if(tokenAddress==address(2))
        {
             if(costliz>0)
                _Lizaddr.safeTransferFrom(msg.sender, address(this), costliz); 
        }
        else
        {
            tokenAddress.safeTransferFrom(msg.sender, address(_lpPools[tokenAddress].poolwallet), amount);
            if(costliz>0)
                _Lizaddr.safeTransferFrom(msg.sender, address(_lpPools[tokenAddress].poolwallet), costliz);
        }

        _lpPools[tokenAddress].poolwallet.addBalance(msg.sender,amount,costliz);
        _lpPools[tokenAddress].totaljthash= _lpPools[tokenAddress].totaljthash.add(hashb);
        _userLphash[msg.sender][tokenAddress] = _userLphash[msg.sender][tokenAddress].add(hashb);
        
        address parent=msg.sender;
        uint256 dhash=0;

        for(uint i=0;i<20;i++)
        {
            parent = _parents[parent];
            if(parent==address(0))
                break;
            _teamhashdetail[parent][msg.sender] = _teamhashdetail[parent][msg.sender].add(hashb);
            _userlevelhashtotal[parent][i]= _userlevelhashtotal[parent][i].add(hashb);
            uint256 parentlevel= _userInfos[parent].userlevel;
            if(_levelconfig[parentlevel][i] > 0)
            {
                uint256 addhash= hashb.mul(_levelconfig[parentlevel][i]).div(1000);
                if(addhash > 0)
                {
                    dhash=dhash.add(addhash);
                    UserHashChanged(parent,0,addhash,true,block.number);
                }
            }
        }
        UserHashChanged(msg.sender,hashb,0,true,block.number);
        logCheckPoint(hashb.add(dhash),true,block.number);
        emit UserBuied(tokenAddress,amount);
        return true;
    }
}