// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;

contract LizMinerDefine
{
    struct UserInfo
    {
        uint256 selfhash;//user hash total count
        uint256 teamhash;
        uint256 userlevel; // my userlevel
        uint256 pendingreward;
        uint256 lastcheckpoint;
        uint256 lastblock;
    }

    struct CheckPoint
    {
        uint256 startblock;
        uint256 totalhash;
    }
}