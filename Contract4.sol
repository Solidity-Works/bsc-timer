//SPDX-License-Identifier: MIT License
pragma solidity >=0.8.4;
/**
 * Created by thelambodan
 * Contributed by Big Bo
 * Contributed to by Joshua James
 */
contract Schedule {
    //Testnet 0x6EbB2a5a6CB4F268939D9e8d70802be364338d40
    //Testnet.2 0x6393c0b01224ed9cae98bff6e3b488b1190d5aa3
    //Testnet.3 0x32555b0B945d3ed9831EdAF01348E1a61c0F9FC2
    //Testnet.4 0x833bc6596a7c458E6719f6e7Dd03B200A3dB514A
    //Testnet.5 0x773eC526704f22d9e34109ECb6BD13D3555306B1
    //Testnet.6 0x0E627548eEcCc1629742B6519B04735203Ed7FFE attempt for sending to contract as bank
    //Testnet.7 0xEc67ddCB262D7d13Bd306013A3E8C5e9fd24b9F2 fix attempt for sending to contract
    //Testnet.8 0x22421c7782188422fC6517bA771aC52Bdc9B26a7 fix attempt # 2
    //Testnet 9 0x9323034A47d7D934FF4e432337f88E0DA66fBFEB external receive/fallback function uncallable by same contract so no more sending to contract
    //Testnet .91 0x6414f85fece3014B4e7372D8B75132e5D7654cd1 allows removing bounty and sent amount from non-finalized orders
    //Testnet .92 0x5dd619Fa01D18bAe58fFAd6d24eB7E84e577A1a0 fixes removeFromOrder function issue with removing from bounty and not amount
    // 3,427,356 gas so use 3.6M deployment limit
    //Mainnet .92 0x3D45DB12E607aa21207C8CdF2a17A00939e65802
    struct Order{
        //Linked list time mapping key
        uint256 prev;
        uint256 next;
        uint256 bounty;
        uint256 amount;
        bool finalized;
    }
    struct User{
        address prev;
        address next;
        //if(prev==0x0 && next==0x0 && incomingHeads[sink][source]!=source) then there is no incoming order from source to sink
    }
    //map of users
    mapping(address=>User) public users;
    address public head;
    ////////////////////
    //map of each user's receiving party
    //user => receiving party
    mapping(address=>mapping(address=>User)) public party;
    mapping(address=>address)public partyHeads;
    ////////////////////
    //incoming orders
    mapping(address=>mapping(address=>User))public incoming;
    mapping(address=>address)public incomingHeads;
    ////////////////////
    //map of orders for each party
    //user => receiving party => time
    mapping(address=>mapping(address=>mapping(uint=>Order))) public orders;
    mapping(address=>mapping(address=>uint))public orderHeads;
    //////////////////
    //outgoing and completed amounts and bounties
    uint public outBounty;
    uint public outAmount;
    uint public completedBounty;
    uint public completedAmount;
    function removeUser(address source)internal{
        //remove source from users list
        if(head==source){
            head=users[head].next;
            //if list isn't empty after removing head
            if(head!=address(0x0)){
                if(users[source].prev!=head){
                    users[users[source].next].prev=users[source].prev;
                }
                else{
                    users[users[source].next].prev=address(0x0);
                }
            }
        }
        else{
            //update previous node next
            users[users[source].prev].next=users[source].next;
            //update next node previous
            if(users[source].next!=address(0x0)){
                users[users[source].next].prev=users[source].prev;
            }
            //update head node previous if deleting tail end of list
            else{
                users[head].prev=users[source].prev;
            }
        }
        delete users[source];
    }
    function removeParty(address source, address sink) internal{
        //remove from incoming
        if(source==incomingHeads[sink]){
            incomingHeads[sink]=incoming[sink][source].next;
            //if sink still has incoming orders
            if(incomingHeads[sink]!=address(0x0)){
                //if incoming being removed is not at end of incoming list
                if(incoming[sink][source].prev!=incomingHeads[sink]){
                    incoming[sink][incoming[sink][source].next].prev=incoming[sink][source].prev;
                }
                else{
                    incoming[sink][incoming[sink][source].next].prev=address(0x0);
                }
            }
        }
        else{
            //update previous node next
            incoming[sink][incoming[sink][source].prev].next=incoming[sink][source].next;
            //update next node previous
            if(incoming[sink][source].next!=address(0x0)){
                incoming[sink][incoming[sink][source].next].prev=incoming[sink][source].prev;
            }
            //update head node previous if deleting tail end of list
            else{
                incoming[sink][incomingHeads[sink]].prev=incoming[sink][source].prev;
            }
        }
        delete incoming[sink][source];
        //remove from parties
        if(sink==partyHeads[source]){
            partyHeads[source]=party[source][sink].next;
            //if sink still has incoming orders
            if(partyHeads[source]!=address(0x0)){
                //if source.prev is not the new head
                if(party[source][sink].prev!=partyHeads[source]){
                    party[source][party[source][sink].next].prev=party[source][sink].prev;
                }
                else{
                    party[source][partyHeads[source]].prev=address(0x0);
                }
            }
            else{
                //source User has no more outgoing orders so remove it from users list
                removeUser(source);
            }
        }
        else{
            //update previous node next
            party[source][party[source][sink].prev].next=party[source][sink].next;
            //update next node previous
            if(party[source][sink].next!=address(0x0)){
                party[source][party[source][sink].next].prev=party[source][sink].prev;
            }
            //update head node previous if deleting tail end of list
            else{
                party[source][partyHeads[source]].prev=party[source][sink].prev;
            }
        }
        delete party[source][sink];
    }
    function removeOrder(address source, address sink, uint time) internal{
        if(time==orderHeads[source][sink]){
            orderHeads[source][sink]=orders[source][sink][time].next;
            //remove receiver from parties since no more outgoing orders to it
            if(orderHeads[source][sink]==0){
                removeParty(source,sink);
            }
            else{
                //if more than two nodes left
                if(orders[source][sink][time].prev!=orderHeads[source][sink]){
                    orders[source][sink][orders[source][sink][time].next].prev=orders[source][sink][time].prev;
                }
                //else head.prev!=head
                else{
                    orders[source][sink][orders[source][sink][time].next].prev=0;
                }
            }
        }
        else{
            //update previous node next
            orders[source][sink][orders[source][sink][time].prev].next=orders[source][sink][time].next;
            //update next node previous
            if(orders[source][sink][time].next!=0){
                orders[source][sink][orders[source][sink][time].next].prev=orders[source][sink][time].prev;
            }
            //update head node previous if deleting tail end of list
            else{
                orders[source][sink][orderHeads[source][sink]].prev=orders[source][sink][time].prev;
            }
        }
        delete orders[source][sink][time];
    }
    function addOrder(address source,address sink, uint time,uint bounty,uint amount, bool finalized)internal{
        //if source user not in list
        if(users[source].prev==address(0x0)){
            //if users list is empty
            if(head==address(0x0)){
                head=source;
                users[source].prev=source;
            }
            else{
                users[source].prev=users[head].prev;
                users[users[head].prev].next=source;
                users[head].prev=source;
            }
        }
        //if source user has no outgoing parties to sink receiver
        if(party[source][sink].prev==address(0x0)){
            //if party list is empty for source user
            if(partyHeads[source]==address(0x0)){
                partyHeads[source]=sink;
                party[source][sink].prev=sink;
            }
            else{
                party[source][sink].prev=party[source][partyHeads[source]].prev;
                party[source][party[source][partyHeads[source]].prev].next=sink;
                party[source][partyHeads[source]].prev=sink;
            }
        }
        //if no orders from source to sink receiver
        if(orderHeads[source][sink]==0){
            orderHeads[source][sink]=time;
            orders[source][sink][time].prev=time;
            //add to receiver sink's incoming sender list
            if(incomingHeads[sink]==address(0x0)){
                incomingHeads[sink]=source;
                incoming[sink][source].prev=source;
            }
            else{
                incoming[sink][source].prev=incoming[sink][incomingHeads[sink]].prev;
                incoming[sink][incoming[sink][incomingHeads[sink]].prev].next=source;
                incoming[sink][incomingHeads[sink]].prev=source;
            }
        }
        else{
            //insert at end of list
            orders[source][sink][time].prev=orders[source][sink][orderHeads[source][sink]].prev;
            orders[source][sink][orders[source][sink][orderHeads[source][sink]].prev].next=time;
            orders[source][sink][orderHeads[source][sink]].prev=time;
        }
        orders[source][sink][time].amount=amount;
        orders[source][sink][time].bounty=bounty;
        orders[source][sink][time].finalized=finalized;
    }
    function send(address sink,uint256 bounty,uint256 time,bool finalized) external payable{
        //596458 gas - 421635
        //420K - 600K gas
        if(gasleft()<300000){
            payable(msg.sender).transfer(msg.value);
            revert("low gas");
        }
        if(bounty>msg.value){
            payable(msg.sender).transfer(msg.value);
            revert("invalid bounty");
        }
        if(address(this)==sink){
            payable(msg.sender).transfer(msg.value);
            revert("invalid destination");
        }
        if (msg.value-bounty<=0){
            payable(msg.sender).transfer(msg.value);
            revert("invalid amount");
        }
        if (time==0){
            payable(msg.sender).transfer(msg.value);
            revert("invalid time");
        }
        if (orders[msg.sender][sink][time].amount!=0){
            payable(msg.sender).transfer(msg.value);
            revert("time slot full");
        }
        /*if (msg.sender==sink){
            payable(msg.sender).transfer(msg.value);
            revert("sending to self");
        }*/
        //check if prevTime previous order is correct
        //if order to remove is not head of list
        addOrder(msg.sender,sink,time,bounty,msg.value-bounty,finalized);
        outBounty+=bounty;
        outAmount+=msg.value-bounty;
    }
    function addToOrder(address source,address sink, uint256 time,bool bounty) external payable{
        // 71504 gas
        // 75K gas
        if(gasleft()<16000){
            payable(msg.sender).transfer(msg.value);
            revert("low gas");
        }
        else if(orders[source][sink][time].amount==0){
            payable(msg.sender).transfer(msg.value);
            revert("invalid order");
        }
        if(bounty!=true){
            orders[source][sink][time].amount+=msg.value;
            outAmount+=msg.value;
        }
        else{
            orders[source][sink][time].bounty+=msg.value;
            outBounty+=msg.value;
        }
    }
    function removeFromOrder(address sink, uint256 time, uint bnb, bool bounty)external {
      require(orders[msg.sender][sink][time].finalized==false,"order finalized");
      require(gasleft()>10000,"low gas");
      if(bounty&&bnb<=orders[msg.sender][sink][time].bounty){
        //remove from bounty
        orders[msg.sender][sink][time].bounty-=bnb;
        outBounty-=bnb;
      }
      else if(bnb<orders[msg.sender][sink][time].amount){
        //remove from sent amount but not all
        orders[msg.sender][sink][time].amount-=bnb;
        outAmount-=bnb;
      }
      else{
        revert("Too much to remove");
      }
      payable(msg.sender).transfer(bnb);
    }
    function release(address source,address sink,uint256 time) external{
        // 200429 - 215223 gas
        // 201K - 220K gas
        //check if pending order exists
        require(gasleft()>100000,"low gas");
        uint256 amount = orders[source][sink][time].amount;
        uint256 bounty = orders[source][sink][time].bounty;
        require(amount+bounty!=0,"invalid order");
        //check if order can be sent based on original sender and time
        require(time<=block.timestamp||msg.sender==source,"unauthorized");
        //mark order complete by removing it
        removeOrder(source,sink,time);
        //award bounty to executor
        payable(msg.sender).transfer(bounty);
        //send BNB to recipient
        payable(sink).transfer(amount);
        outAmount-=amount;
        outBounty-=bounty;
        completedAmount+=amount;
        completedBounty+=bounty;
    }
    function cancelOrder(address sink, uint256 time)external{
        //160406 gas
        // 165K gas
        uint256 amount = orders[msg.sender][sink][time].amount;
        uint256 bounty = orders[msg.sender][sink][time].bounty;
        require(gasleft()>40000,"low gas");
        require(orders[msg.sender][sink][time].amount!=0,"invalid order");
        require(orders[msg.sender][sink][time].finalized==false,"order finalized");
        uint refund = orders[msg.sender][sink][time].amount+orders[msg.sender][sink][time].bounty;
        removeOrder(msg.sender,sink,time);
        payable(msg.sender).transfer(refund);
        outAmount-=amount;
        outBounty-=bounty;
    }
    function finalize(address sink, uint256 time)external{
        //not payable so no refund for low gas needed
        //low gas cuases state to revert
        require(orders[msg.sender][sink][time].amount!=0,"invalid order");
        orders[msg.sender][sink][time].finalized=true;
    }
    receive()external payable{
      payable(address(msg.sender)).transfer(msg.value);
    }
}
