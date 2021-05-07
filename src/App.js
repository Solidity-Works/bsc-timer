import React, {useState,Component} from 'react';
import './App.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ToggleButton from 'react-toggle-button';

import BigNumber from 'bignumber.js';
import {ethers} from 'ethers';
//import Web3Connect from "web3connect";

import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

/*
  * Created by thelambodan
  * Contributor Big Bo
  * Main Developer Joshua James
*/
const selectedSidebar ="#d9d332";
const deselectedSidebar ="#aba624";
//const Testnet 0x6EbB2a5a6CB4F268939D9e8d70802be364338d40
//const testContract = "0x6393c0b01224ed9cae98bff6e3b488b1190d5aa3" //first alpha version with no errors
//const testContract = "0x32555b0B945d3ed9831EdAF01348E1a61c0F9FC2";
//const testContract = "0x833bc6596a7c458E6719f6e7Dd03B200A3dB514A";
//const testContract = "0x773eC526704f22d9e34109ECb6BD13D3555306B1";
//const testContract = "0x0E627548eEcCc1629742B6519B04735203Ed7FFE";
//const testContract = "0xEc67ddCB262D7d13Bd306013A3E8C5e9fd24b9F2";
//const testContract = "0x22421c7782188422fC6517bA771aC52Bdc9B26a7";
//const testContract = "0x9323034A47d7D934FF4e432337f88E0DA66fBFEB"; // fix can no longer send order to contract
//const testContract = "0x6414f85fece3014B4e7372D8B75132e5D7654cd1"; // can remove bounty and amount sent from non-finalized order
const testContract = "0x5dd619Fa01D18bAe58fFAd6d24eB7E84e577A1a0"; //fix removeFromOrder function
class App extends Component{
  constructor(){
    super();
    // Don't call this.setState() here!
    this.state = {};
    this.web3=null;
    this.list=[];//list of orders to display in viewer
    this.maxSeconds=604800;//display orders releasable within 7 days
    this.minSeconds=0;//display orders releasable within 7 days
    this.maxOrders=20;//display 100 most recent orders
    this.timeOffset=0;//UTC offset by hours
    this.address="Not Connected";
    this.provider=null;
    this.pendingAmount=0;
    this.pendingBounty=0;
    this.completedAmount=0;
    this.completedBounty=0;
    this.chain=null;
    this.contractAddress=null;
    this.contract=null;
    this.hooked=false;
    //////button color
    this.bountyColor=selectedSidebar;
    this.incomingColor=deselectedSidebar;
    this.sentColor=deselectedSidebar;
    //////buttons
    this.connect=this.connect.bind(this);
    this.wallet_connect=this.wallet_connect.bind(this);
    this.handleBounty=this.handleBounty.bind(this);
    this.handleSent=this.handleSent.bind(this);
    this.handleIncoming=this.handleIncoming.bind(this);
    this.autoUpdate=this.autoUpdate.bind(this);
    this.secToDate=this.secToDate.bind(this);
    this.isConnected=this.isConnected.bind(this);
    this.search=this.search.bind(this);
    this.isAddress=this.isAddress.bind(this);
    this.isUint=this.isUint.bind(this);
    this.isTime=this.isTime.bind(this);
    this.orderFilter=this.orderFilter.bind(this);
    this.loadTotalAmounts=this.loadTotalAmounts.bind(this);
    this.removeFromOrder=this.removeFromOrder.bind(this);
    //////load tabular order data for ag grid viewer element
    /*this.abi=[{"inputs":[{"internalType":"address","name":"source","type":"address"},{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"},{"internalType":"bool","name":"bounty","type":"bool"}],"name":"addToOrder","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"cancelOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"completedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"completedBounty","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"finalize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"head","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"incoming","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"incomingHeads","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"orderHeads","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"orders","outputs":[{"internalType":"uint256","name":"prev","type":"uint256"},{"internalType":"uint256","name":"next","type":"uint256"},{"internalType":"uint256","name":"bounty","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"finalized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"outAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"outBounty","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"party","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"partyHeads","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"source","type":"address"},{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"bounty","type":"uint256"},{"internalType":"uint256","name":"time","type":"uint256"},{"internalType":"bool","name":"finalized","type":"bool"}],"name":"send","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];*/
    this.abi=[{"inputs":[{"internalType":"address","name":"source","type":"address"},{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"},{"internalType":"bool","name":"bounty","type":"bool"}],"name":"addToOrder","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"cancelOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"finalize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"source","type":"address"},{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"}],"name":"release","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"time","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"bounty","type":"bool"}],"name":"removeFromOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sink","type":"address"},{"internalType":"uint256","name":"bounty","type":"uint256"},{"internalType":"uint256","name":"time","type":"uint256"},{"internalType":"bool","name":"finalized","type":"bool"}],"name":"send","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"},{"inputs":[],"name":"completedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"completedBounty","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"head","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"incoming","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"incomingHeads","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"orderHeads","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"orders","outputs":[{"internalType":"uint256","name":"prev","type":"uint256"},{"internalType":"uint256","name":"next","type":"uint256"},{"internalType":"uint256","name":"bounty","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bool","name":"finalized","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"outAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"outBounty","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"party","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"partyHeads","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"address","name":"prev","type":"address"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"}];
    //////
    this.autoUpdate();
    setInterval(this.autoUpdate, 1000);
  }
  async loadTotalAmounts(){
    this.pendingAmount= ethers.utils.formatEther((await this.contract.outAmount()).toString()).substr(0,4);
    this.pendingBounty= ethers.utils.formatEther((await this.contract.outBounty()).toString()).substr(0,4);
    this.completedAmount= ethers.utils.formatEther((await this.contract.completedAmount()).toString()).substr(0,4);
    this.completedBounty= ethers.utils.formatEther((await this.contract.completedBounty()).toString()).substr(0,4);
  }
  async connect(){
    try{
      if(window.ethereum){
        await window.ethereum.enable();
        this.address = (await window.ethereum.request({method: 'eth_accounts'}))[0];
        this.chain = (await window.ethereum.request({method: 'eth_chainId'}));
        this.provider=new ethers.providers.Web3Provider(window.ethereum);
        if(this.chain=='0x38'){
          this.chain = 'Mainnet';
        }
        else if(this.chain=='0x61'){
          this.chain = 'Testnet';
          this.contractAddress=testContract;
        }
        else{
          this.chain = null;
          this.contractAddress=null;
        }
      }
      if(!this.hooked){
        document.getElementById("maxNumOrders").value =this.maxOrders.toString();
        document.getElementById("maxTimeOrders").value = "7";
        document.getElementById("minTimeOrders").value = "0";
        document.getElementById("finalize").value2=false;
        this.maxSeconds=Math.floor(Date.now()/1000)+ 604800;
        window.ethereum.on('accountsChanged', (accounts) => {
          if(accounts.length!=0){
            this.address=accounts[0];
            this.provider=new ethers.providers.Web3Provider(window.ethereum);
            this.loadBounty();
            this.bountyColor=selectedSidebar;
            this.incomingColor=deselectedSidebar;
            this.sentColor=deselectedSidebar;
            this.provider=new ethers.providers.Web3Provider(window.ethereum);
          }
          else{
            this.address="Not Connected";
          }
        });
        window.ethereum.on('chainChanged', (chain) => {
          if(chain=='0x38'){
            this.chain = 'Mainnet';
            //this.loadTotalAmounts();
          }
          else if(chain=='0x61'){
            this.chain = 'Testnet';
            this.contractAddress=testContract;
            this.loadBounty();
            this.bountyColor=selectedSidebar;
            this.incomingColor=deselectedSidebar;
            this.sentColor=deselectedSidebar;
            this.loadTotalAmounts();
          }
          else{
            this.chain = null;
            this.contractAddress=null;
          }
        });
        this.hooked=true;
        this.loadBounty();
      }
      this.forceUpdate();
    }
    catch(e){}
  }
  async wallet_connect(){
    //https://github.com/WalletConnect/walletconnect-example-dapp/blob/master/src/App.tsx
    //https://github.com/Web3Modal/web3modal
    if(this.address=="Not Connected"){
      try{
        window.alert("Sorry\nFeature not developed yet!")
        /*const providerOptions = {
          const provider = new WalletConnectProvider({
            infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Required
          });*/
      }
      catch(e){}
    }
  }
  async autoUpdate(){
    const d = new Date;
    this.time=this.secToDate(d);
    this.forceUpdate();
  }
  secToDate(d){
    d.setHours(d.getHours()+this.timeOffset);
    let h= "0";
    let m= "0";
    let s= "0";
    if(d.getUTCHours()>9){h=d.getUTCHours().toString()}
    else{h='0'.concat(d.getUTCHours().toString())}
    if(d.getUTCMinutes()>9){m=d.getUTCMinutes().toString()}
    else{m='0'.concat(d.getUTCMinutes().toString())}
    if(d.getUTCSeconds()>9){s=d.getUTCSeconds().toString()}
    else{s='0'.concat(d.getUTCSeconds().toString())}
    const str=d.getUTCFullYear().toString().concat('/',d.getUTCMonth()+1,'/',d.getUTCDate(),' @ ',
    h,':',m,':',s);
    return str;
  }
  elapsedTime(d){
    if(d<0){
      return 0;
    }
    let s = Math.trunc(d/86400).toString();
    s=s+"d/";
    s=s+Math.abs(Math.trunc((d%86400)/3600)).toString();
    s=s+"h/";
    s=s+Math.abs(Math.trunc((d%3600)/60)).toString();
    s=s+"m/";
    s=s+Math.abs(d%60).toString();
    s=s+"s";
    return s;
  }
  handleConverter(){
    window.open("https://www.epochconverter.com/", "_blank") //to open new page
  }
  handleBounty(){
    this.bountyColor=selectedSidebar;
    this.incomingColor=deselectedSidebar;
    this.sentColor=deselectedSidebar;
    if(this.hooked&&this.isConnected()){
      this.loadBounty();
    }
    this.forceUpdate();
  }
  async handleSent(){
    const x = [];
    if(this.hooked&&this.isConnected()){
      this.incomingColor=selectedSidebar;
      this.bountyColor=deselectedSidebar;
      this.sentColor=deselectedSidebar;
      let party = await this.contract.partyHeads(this.address);
      while(party){
        let time = await this.contract.orderHeads(this.address,party);
        let order = await this.contract.orders(this.address,party,time);
        let fin = null;
        while(!time.isZero()){
          if(order.finalized){fin="Yes";}
          else{fin="No";}
          x.push({
            Sender: this.address,
            Receiver: party,
            "Finalized?": fin,
            "Epoch Time ↕": time.toString(),
            Time: this.secToDate(new Date(time.mul('1000').toNumber())),//new Date(Date.now(time)).toISOString()
            "Bounty ↕": ethers.utils.formatEther(order.bounty.toString()),
            "Amount ↕": ethers.utils.formatEther(order.amount.toString()),
            "Countdown ↕": this.elapsedTime(time.toString()-Math.trunc(Date.now()/1000))
          });
          time=order.next;
          order = await this.contract.orders(this.address,party,time);
        }
        party=await this.contract.party(this.address,party).next;
      }
      this.list=x;
    }
  }
  async handleIncoming(){
    const x = [];
    if(this.hooked&&this.isConnected()){
      this.sentColor=selectedSidebar;
      this.bountyColor=deselectedSidebar;
      this.incomingColor=deselectedSidebar;
      let party = await this.contract.incomingHeads(this.address);
      while(party){
        let time = await this.contract.orderHeads(party,this.address);
        let order = await this.contract.orders(party,this.address,time);
        let fin = null;
        while(!time.isZero()){
          if(order.finalized){fin="Yes";}
          else{fin="No";}
          x.push({
            Sender: this.address,
            Receiver: party,
            "Finalized?": fin,
            "Epoch Time ↕": time.toString(),
            Time: this.secToDate(new Date(time.mul('1000').toNumber())),//new Date(Date.now(time)).toISOString()
            "Bounty ↕": ethers.utils.formatEther(order.bounty.toString()),
            "Amount ↕": ethers.utils.formatEther(order.amount.toString()),
            "Countdown ↕": this.elapsedTime(time.toString()-Math.trunc(Date.now()/1000))
          });
          time=order.next;
          order = await this.contract.orders(party,this.address,time);
        }
        party=await this.contract.incoming(party,this.address).next;
      }
      this.list=x;
    }
  }
  async isConnected(){
    if(this.address!="Not Connected"){
      if(this.chain&&this.chain=='Mainnet'||this.chain=='Testnet'){
        //this.signer=this.provider.getSigner();
        return true;
      }
      else{
        window.alert('Wrong Network!');
      }
    }
    else{
      window.alert('Not Connected!');
    }
    return false;
  }
  orderFilter(){
    document.getElementById('maxTimeOrders').value=this.stringCleaner(document.getElementById('maxTimeOrders').value);
    document.getElementById('maxNumOrders').value=this.stringCleaner(document.getElementById('maxNumOrders').value);
    if(this.isTime(document.getElementById('maxTimeOrders').value)&&document.getElementById('maxTimeOrders').value.length>0){
      let d = new Date();
      d.setDate(d.getDate() + parseInt(document.getElementById('maxTimeOrders').value));
      this.maxSeconds=Math.floor(d.getTime()/1000);
    }
    if(this.isTime(document.getElementById('minTimeOrders').value)&&document.getElementById('minTimeOrders').value.length>0){
      let d = new Date();
      d.setDate(d.getDate() + parseInt(document.getElementById('minTimeOrders').value));
      this.minSeconds=Math.floor(d.getTime()/1000);
    }
    if(this.isTime(document.getElementById('maxNumOrders').value)&&document.getElementById('maxNumOrders').value.length>0){
      this.maxOrders=parseInt(document.getElementById('maxNumOrders').value);
    }
  }
  async loadBounty(){
    //TODO add contract into ethers to load data
    //https://github.com/pancakeswap/pancake-frontend/blob/develop/src/utils/lotteryUtils.ts
    this.orderFilter();
    if(await this.isConnected()){
      if(!this.contract||this.contractAddress.toLowerCase()!=this.contract.address.toLowerCase()){
        this.contract = new ethers.Contract(this.contractAddress, this.abi, this.provider.getSigner());
      }
      let user = await this.contract.head();
      let party = await this.contract.partyHeads(user);
      let time = (await this.contract.orderHeads(user,party)).toString();
      let order = await this.contract.orders(user,party,time);
      let fin = null;
      let x=[];
      let i =0; const j = parseInt(this.maxOrders.toString());
      BigNumber.set({ DECIMAL_PLACES: 18 });
      while(i<j&&user){
        while(i<j&&party){
          while(i<j&&"0"!=time){
            if(order.finalized){fin="Yes";}
            else{fin="No";}
            if(BigNumber(time).isLessThan(this.maxSeconds)){
              x.push({
                Sender: user,
                Receiver: party,
                "Finalized?": fin,
                "Epoch Time ↕": time,
                Time: this.secToDate(new Date(BigNumber(time).multipliedBy('1000').toNumber())),//new Date(Date.now(time)).toISOString()
                "Bounty ↕": ethers.utils.formatEther(order.bounty.toString()),
                "Amount ↕": ethers.utils.formatEther(order.amount.toString()),
                "Countdown ↕": this.elapsedTime(time-Math.trunc(Date.now()/1000))
              });
            }
            time=order.next.toString();
            order = await this.contract.orders(user,party,time);
            i++;
          }
          party = await this.contract.party(user,party).next;
        }
        user = await this.contract.users(user).next;
      }
      this.list=x;
      this.loadTotalAmounts();
    }
  }
  async search(user,party){
    user = this.stringCleaner(user);
    party = this.stringCleaner(party);
    if(await this.isConnected()){
      try{
        const x = [];
        let time = await this.contract.orderHeads(user,party);
        let order = await this.contract.orders(user,party,time);
        let fin=null;
        while(!time.isZero()){
          if(order.finalized){fin="Yes";}
          else{fin="No";}
          x.push({
            Sender: user,
            Receiver: party,
            "Finalized?": fin,
            "Epoch Time ↕": time.toString(),
            Time: this.secToDate(new Date(time.mul('1000').toNumber())),//new Date(Date.now(time)).toISOString()
            "Bounty ↕": ethers.utils.formatEther(order.bounty.toString()),
            "Amount ↕": ethers.utils.formatEther(order.amount.toString()),
            "Countdown ↕": this.elapsedTime(time.toString()-Math.trunc(Date.now()/1000))
          });
          time=order.next;
          order = await this.contract.orders(user,party,time);
        }
        this.list=x;
      }
      catch(e){}
    }
  }
  async send(receiver,time,amount,bounty,finalized){
    receiver.replace(/\s+/g, '');
    time.replace(/\s+'&nbsp'+/g, '');
    amount.replace(/\s+/g, '');
    bounty.replace(/\s+/g, '');
    time=this.stringCleaner(time);
    amount= this.stringCleaner(amount);
    bounty=this.stringCleaner(bounty);
    receiver=this.stringCleaner(receiver);
    if(await this.isConnected())
    {
      try{
        const confirm = "Receiver - "+ receiver
                        +"\nTime              - "+ this.secToDate(new Date(parseInt(time)))
                        +"\n Amount         - "+amount+ " BNB"
                        +"\n Bounty / Fee - "+bounty+ " BNB"
                        +"\n Finalized?     - "+(finalized?"Yes":"No");
        if(!this.isAddress(receiver)){
          window.alert("Invalid receiver address\nCannot send to contract!");
        }
        else if(!this.isTime(time)){
          window.alert("Invalid time");
        }
        else if(!this.isUint(amount) || BigNumber(amount).isLessThanOrEqualTo(BigNumber("0"))){//&& BigNumber(amount).isGreaterThan(BigNumber("0"))
          window.alert("Invalid amount");
        }
        else if(!this.isUint(bounty) || BigNumber(bounty).isLessThan(BigNumber("0"))){
          window.alert("Invalid bounty");
        }
        else if(!(await this.contract.orders(this.address,receiver,time)).amount.isZero()){
          window.alert("Timeslot full!\nChange epoch time or add amount to existing order");
        }
        else if (await window.confirm(confirm)){
          amount = (new BigNumber(amount)).multipliedBy("1000000000000000000");
          bounty = (new BigNumber(bounty)).multipliedBy("1000000000000000000");
          const total = amount.plus(bounty).toString();
          amount=amount.toString();
          bounty=bounty.toString();
          await this.contract.send(receiver,bounty,time,finalized,{gasPrice: 10000000000, gasLimit: 400000, value: total});
          //const callPromise = await this.contract.send(receiver,bounty,time,finalized,{gasPrice: 10000000000, gasLimit: 579000, value: total});
          //console.log(callPromise); //  callPromise.hash can be checked with bscscan
        }
      }
      catch(e){}
    }
  }
  async finalize(receiver,time){
    receiver.replace(/\s+/g, '');
    time.replace(/\s+'&nbsp'+/g, '');
    time=this.stringCleaner(time);
    receiver=this.stringCleaner(receiver);
    if(await this.isConnected())
    {
      try{
        const order = await this.contract.orders(this.address,receiver,time);
        const confirm = "Are you sure you want to Finalize ?"
                        +"\nReceiver - "+ receiver
                        +"\nTime              - "+ this.secToDate(new Date(parseInt(time)))
                        +"\n Amount         - "+ethers.utils.formatEther(order.amount.toString())+ " BNB"
                        +"\n Bounty / Fee - "+ethers.utils.formatEther(order.bounty.toString())+ " BNB"
                        +"\n Finalized?     - "+(order.finalized?"Yes":"No");
        if(!this.isAddress(receiver)){
          window.alert("Invalid receiver address");
        }
        else if(!this.isTime(time)){
          window.alert("Invalid time");
        }
        else if(order.amount.isZero()){
          window.alert("Order does not exist");
        }
        else if(order.finalized){
          window.alert("Order already finalized");
        }
        else if (await window.confirm(confirm)){
          await this.contract.finalize(receiver,time,{gasPrice: 10000000000, gasLimit: 50000});
        }
      }
      catch(e){}
    }
  }
  async addToOrder(sender,receiver,time,bnb,isBounty){
    receiver.replace(/\s+/g, '');
    time.replace(/\s+'&nbsp'+/g, '');
    bnb.replace(/\s+/g, '');
    sender.replace(/\s+/g, '');
    time=this.stringCleaner(time);
    bnb= this.stringCleaner(bnb);
    receiver= this.stringCleaner(receiver);
    sender= this.stringCleaner(sender);
    if(await this.isConnected()){
      try{
        const order = await this.contract.orders(sender,receiver,time);
        const confirm = "Are you sure you want to Add to Order ?"
                        +"\n Sender - "+ sender
                        +"\n Receiver - "+ receiver
                        +"\n Time              - "+ this.secToDate(new Date(parseInt(time)))
                        +"\n Current BNB to Send  - "+ethers.utils.formatEther(order.amount.toString())+ " BNB"
                        +"\n Current Bounty / Fee - "+ethers.utils.formatEther(order.bounty.toString())+ " BNB"
                        +"\n Adding - "+bnb+" to "+(isBounty?"Bounty":"Sent amount");
        if(!this.isAddress(sender)){
          window.alert("Invalid sender address");
        }
        else if(!this.isAddress(receiver)){
          window.alert("Invalid receiver address");
        }
        else if(!this.isTime(time)){
          window.alert("Invalid time");
        }
        else if(!this.isUint(bnb) || BigNumber(bnb).isLessThanOrEqualTo(BigNumber("0"))){
          window.alert("Invalid bounty");
        }
        else if((await this.contract.orders(sender,receiver,time)).amount.isZero()){
          window.alert("Order does not exist");
        }
        else if (window.confirm(confirm)){
          bnb = (new BigNumber(bnb)).multipliedBy("1000000000000000000").toString();
          await this.contract.addToOrder(this.address,receiver,time,isBounty,{gasPrice: 10000000000, gasLimit: 45000, value: bnb});
        }
      }
      catch(e){}
    }
  }
  async removeFromOrder(receiver,time,bnb,isBounty){
    receiver.replace(/\s+/g, '');
    time.replace(/\s+'&nbsp'+/g, '');
    bnb.replace(/\s+/g, '');
    time=this.stringCleaner(time);
    bnb= this.stringCleaner(bnb);
    receiver= this.stringCleaner(receiver);
    if(await this.isConnected()){
      try{
        const order= await this.contract.orders(this.address,receiver,time);
        const confirm = "Are you sure you want to Modify Order ?"
                        +"\n Receiver - "+ receiver
                        +"\n Time              - "+ this.secToDate(new Date(parseInt(time)))
                        +"\n Current BNB to Send  - "+ethers.utils.formatEther(order.amount.toString())+ " BNB"
                        +"\n Current Bounty / Fee - "+ethers.utils.formatEther(order.bounty.toString())+ " BNB"
                        +"\n Removing - "+bnb+" from "+(isBounty?"Bounty":"Sent amount");
        if(!this.isAddress(receiver)){
          window.alert("Invalid receiver address");
        }
        else if(!this.isTime(time)){
          window.alert("Invalid time");
        }
        else if(!this.isUint(bnb)){
          window.alert("Invalid amount");
        }
        else if (isBounty==false&&!BigNumber(bnb).multipliedBy("1000000000000000000").minus(order.amount).isNegative()){
          window.alert("  Amount  must be less than \n total order amount to be sent \n     (cancel order instead)");
        }
        else if (isBounty==true&&BigNumber(order.bounty.toString()).isLessThan(BigNumber(bnb).multipliedBy("1000000000000000000"))){
          window.alert("Bounty to remove from order cannot be\n   greater than total bounty in order");
        }
        else if(order.amount.isZero()){
          window.alert("Order does not exist");
        }
        else if (window.confirm(confirm)){
          bnb = (new BigNumber(bnb)).multipliedBy("1000000000000000000").toString();
          await this.contract.removeFromOrder(receiver,time,bnb,isBounty,{gasPrice: 10000000000, gasLimit: 60000});
        }
      }
      catch(e){}
    }
  }
  async release(sender,receiver,time){
    sender.replace(/\s+/g, '');
    receiver.replace(/\s+/g, '');
    time.replace(/\s+'&nbsp'+/g, '');
    time=this.stringCleaner(time);
    receiver=this.stringCleaner(receiver);
    sender=this.stringCleaner(sender);
    if(await this.isConnected())
    {
      try{
        if(!this.isAddress(sender)){
          window.alert("Invalid sender address");
        }
        else if(!this.isAddress(receiver)){
          window.alert("Invalid receiver address");
        }
        else if(!this.isTime(time)){
          window.alert("Invalid time");
        }
        else if((await this.contract.orders(sender,receiver,time)).amount.isZero()){
          window.alert("Order does not exist");
        }
        else if((this.address.toLowerCase()!=sender.toLowerCase())&&BigNumber(time).isGreaterThan(Math.floor(Date.now()/1000))){
          window.alert("Too early to execute order");
        }
        else{
          await this.contract.release(sender,receiver,time,{gasPrice: 10000000000, gasLimit: 150000});
        }
      }
      catch(e){}
    }
  }
  async cancel(receiver,time){
    receiver.replace(/\s+/g, '');
    time.replace(/\s+'&nbsp'+/g, '');
    time=this.stringCleaner(time);
    receiver = this.stringCleaner(receiver);
    if(await this.isConnected()){
      try{
        if(!this.isAddress(receiver)){
          window.alert("Invalid receiver address");
        }
        else if(!this.isTime(time)){
          window.alert("Invalid time");
        }
        else if((await this.contract.orders(this.address,receiver,time)).amount.isZero()){
          window.alert("Order does not exist");
        }
        else if((await this.contract.orders(this.address,receiver,time)).finalized){
          window.alert("Order is finalized and cannot be cancelled");
        }
        else{
          await this.contract.cancelOrder(receiver,time,{gasPrice: 10000000000, gasLimit: 120000});
        }
      }
      catch(e){}
    }
  }
  isAddress(str){
    return /^(0x)?[0-9a-fA-F]{40}$/.test(str)&&str.toLowerCase()!=this.contractAddress.toLowerCase();
  }
  isUint(str){
    return (/^\d*\.?\d*$/.test(str)&&
    BigNumber(str).multipliedBy("1000000000000000000").integerValue().isEqualTo(BigNumber(str).multipliedBy("1000000000000000000"))&&
    BigNumber(str).isLessThan(BigNumber("115792089237316195423570985008687907853269984665640564039457584007913129639935")));
  }
  stringCleaner(str){
    let x='';
    let i=0;
    while(i<str.length){
      if(str.charCodeAt(i)!=32&&str.charAt(i)!=' '){
        x+=str.charAt(i);
      }
      i++;
    }
    return x;
  }
  isTime(str){
    return (/^[0-9]*$/.test(str)&& !(BigNumber(str).isZero())&&
    BigNumber(str).isLessThan(BigNumber("115792089237316195423570985008687907853269984665640564039457584007913129639935")));
  }
  rowSelected(row){
    document.getElementById("sender").value =row.data.Sender;
    document.getElementById("receiver").value =row.data.Receiver;
    document.getElementById("time").value =row.data["Epoch Time ↕"];
    document.getElementById("amount").value =row.data["Amount ↕"];
    document.getElementById("bounty").value =row.data["Bounty ↕"];
  }
  render(){
    return(
      <div>{/*all elements must be contained in 1 div*/}
        <Navbar sticky="top" bg = 'dark' style={{maxHeight:"55px",whiteSpace:"nowrap",width:"1518px"}}>
          {/*<Navbar.Brand href="./">*/}
          <Navbar.Brand>
            <h3 style = {{color: 'yellow'}}>BSC Timer ⌛ </h3>
          </Navbar.Brand>
          <Navbar.Collapse>
            <DropdownButton id="dropdown-basic-button" title={this.address.substr(0,15)} style={{maxWidth:"10%",fontWeight:"bold",cursor:"pointer",color:"#3471eb"}}>
              <Button as="input"type ="Button"value="Browser Wallet"onClick={this.connect} style={{width:"160px",height:"50px",marginBottom:"8px"}}/>
              <br></br>
              <Button as="input"type ="Button"value="Wallet Connect"onClick={this.wallet_connect}style={{width:"160px",height:"50px"}}/>
            </DropdownButton>
            <Button as="input"type="Button"onClick={this.handleConverter}value="Epoch Time Converter"style={{fontSize:"15px",backgroundColor:"#d13f0f",marginRight:"8px",marginLeft:"40px",height:"40px",maxWidth:"180px",fontWeight:"bold",cursor:"pointer",backgroundColor:"#f05e1a"}}block/>
          <div>
            <h10 style={{color:'yellow'}}>
              Epoch Time = {Math.floor(Date.now()/1000)} sec.
              <br></br>
              {this.time}
            </h10>
          </div>
          <div style={{marginLeft:"10px"}}>
            <h10 style={{color:'#3399ff'}}>
              BNB Sent > Pending = {this.pendingAmount}
              <br></br>
              BNB Bounty > Pending = {this.pendingBounty} {}
            </h10>
          </div>
          <div style={{marginLeft:"5px",marginRight:"15px"}}>
            <h10 style={{color:'#3399ff'}}>
              / Completed = {this.completedBounty}
              <br></br>
              / Completed = {this.completedAmount}
            </h10>
          </div>
          <p style={{fontSize:"12px",color:'#00b7db',position:'relative',left:'100px',top:'10px'}}>
            {this.chain} {this.address!="Not Connected"?"Contract":""} {" "}
            <br></br>
            {this.contractAddress}
          </p>
          </Navbar.Collapse>
        </Navbar>
        <div id="sidebar" style={{backgroundColor:"#4e8eca",width:"190px",minHeight:"720px",float:"left"}}>
          <div id="menu" style={{padding:"5px"}}>
            <Button as="input"type ="Button"onClick={()=>this.handleBounty()}value="All Orders  ↻"style={{height:"35px",marginBottom:"5px",fontWeight:"bold",cursor:"pointer",backgroundColor:this.bountyColor,color:"#1875de"}}block/>
            <Button as="input"type="Button"onClick={()=>this.handleIncoming()}value="Incoming ↻"style={{height:"35px",fontWeight:"bold",cursor:"pointer",backgroundColor:this.sentColor,color:"#1875de"}}block/>
            <Button as="input"type="Button"onClick={()=>this.handleSent()}value="Outgoing ↻"style={{height:"35px",fontWeight:"bold",cursor:"pointer",backgroundColor:this.incomingColor,color:"#1875de"}}block/>
            <div style ={{fontSize:"13px",color:"#ffe203",fontWeight:"bold",marginTop:"0px"}}>
              {"Sender"}
              <input id ="sender" type="text"pattern="^(0x)?[0-9a-fA-F]{40}\s*$"style={{width:"180px",marginTop:"3px"}}/>
              {"Receiver"}
              <input id ="receiver" type="text"pattern="^(0x)?[0-9a-fA-F]{40}\s*$"style={{width:"180px",marginTop:"3px"}}/>
              {"Epoch Time"}
              <input id ="time" type="number" pattern="^\d*\s*$"style={{width:"180px",marginTop:"3px"}}/>
              {"BNB Amount"}
              <input id ="amount" type="text"pattern="^\d*\.?\d{0,18}\s*$"style={{width:"180px",marginTop:"3px"}}/>
              {"Order Execution Bounty"}
              <input id ="bounty" type="text"pattern="^\d*\.?\d{0,18}\s*$"style={{width:"180px",marginTop:"3px"}}/>
              Finalize Order ?
              <div id="finalize" style={{position:'relative',left:'3px',marginTop:'3px'}}>
                <ToggleButton
                value={this.state.value2 ||false}
                inactiveLabel={'No'}
                activeLabel={'Yes'}
                colors={{
                  inactiveThumb: {base: 'rgb(250,0,0)',hover:'rgb(0,200,0)'},
                  activeThumb: {base: 'rgb(0,250,0)',hover:'rgb(200,0,0)'},
                  active: {base: 'rgb(0,100,0)',hover:'rgb(100,0,0)'},
                  inactive: {base: 'rgb(100,0,0)',hover:'rgb(0,70,0)'}
                }}
                onToggle={(value) => {
                  this.setState({value2: !value,});
                  document.getElementById("finalize").value2=!value;
                }} />
              </div>
            </div>
            <Button as="input"type ="Button"onClick={() => this.search(
                document.getElementById("sender").value,
                document.getElementById("receiver").value
              )}value="Search"style={{
              backgroundColor:"green",maxWidth:"175px",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
              color:"white",marginTop:"10px",width:"180px",height:"35px"}}/>
            <Button as="input"type ="Button"value="Send"onClick={() => this.send(
                document.getElementById("receiver").value,
                document.getElementById("time").value,
                document.getElementById("amount").value,
                document.getElementById("bounty").value,
                document.getElementById("finalize").value2
              )}
              style={{backgroundColor:"green",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
              color:"#2eff5f",marginLeft:"3px",minWidth:"70px",marginTop:"5px",height:"40px"}}/>
            <Button as="input"type ="Button"value="Release"onClick={() => this.release(
                document.getElementById("sender").value,
                document.getElementById("receiver").value,
                document.getElementById("time").value
              )}style={{
            backgroundColor:"green",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
            color:"orange",marginLeft:"30px",marginTop:"5px",height:"40px"}}/>
          <Button as="input"type ="Button"value="Finalize"onClick={() => this.finalize(
                document.getElementById("receiver").value,
                document.getElementById("time").value
              )}style={{
              backgroundColor:"green",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
              color:"#00ffee",marginLeft:"3px",marginTop:"5px",height:"40px"}}/>
            <Button as="input"type ="Button"value="Cancel"onClick={() => this.cancel(
                document.getElementById("receiver").value,
                document.getElementById("time").value
              )}style={{
              backgroundColor:"green",fontSize:"13px",minWidth:"73px",fontWeight:"bold",cursor:"pointer",
              color:"#ff8fb6",marginLeft:"28px",marginTop:"5px",height:"40px"}}/>
            <Button as="input"type ="Button"value="Increase Amount +"onClick={() => this.addToOrder(
                document.getElementById("sender").value,
                document.getElementById("receiver").value,
                document.getElementById("time").value,
                document.getElementById("amount").value,
                false
              )}style={{
              backgroundColor:"green",minWidth:"100px",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
              color:"yellow",marginTop:"5px",width:"170px",marginLeft:"5px",height:"35px"}}/>
            <Button as="input"type ="Button"value="Increase Bounty +"onClick={() => this.addToOrder(
                document.getElementById("sender").value,
                document.getElementById("receiver").value,
                document.getElementById("time").value,
                document.getElementById("bounty").value,
                true
              )}style={{
                backgroundColor:"green",minWidth:"100px",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
                color:"yellow",marginTop:"5px",marginLeft:"5px",width:"170px",height:"35px"}}/>
            <Button as="input"type ="Button"value="Decrease Amount -"onClick={() => this.removeFromOrder(
              document.getElementById("receiver").value,
              document.getElementById("time").value,
              document.getElementById("bounty").value,
              false
            )}style={{
              backgroundColor:"green",minWidth:"100px",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
              color:"black",marginTop:"5px",marginLeft:"5px",width:"170px",height:"35px"}}/>
            <Button as="input"type ="Button"value="Decrease Bounty -"onClick={() => this.removeFromOrder(
                document.getElementById("receiver").value,
                document.getElementById("time").value,
                document.getElementById("bounty").value,
                true
              )}style={{
                backgroundColor:"green",minWidth:"100px",fontSize:"13px",fontWeight:"bold",cursor:"pointer",
                color:"black",marginTop:"5px",marginLeft:"5px",width:"170px",height:"35px"}}/>
          </div>
        </div>
        <h7 style={{color:"yellow"}}>
          <div id="viewer" style={{backgroundColor:"#1f1f1f",width:"1500",height:"720px"}}>
              <div id="infoBox" style={{overflowX:'hidden',overflowY:'auto',position:'relative',backgroundColor:"#1f1f1f",height:"inherit",padding:"10px"}}>
                <div style={{marginLeft:"10px",color: "orange"}}>
                  Selectable Rows ?
                  <div id="clickSelect"style={{position:'relative',left:'138px',top:'-20px'}}>
                    <ToggleButton
                    value={this.state.value ||false}
                    colors={{
                      inactiveThumb: {base: 'rgb(250,0,0)',hover:'rgb(0,200,0)'},
                      activeThumb: {base: 'rgb(0,250,0)',hover:'rgb(200,0,0)'},
                      active: {base: 'rgb(0,100,0)',hover:'rgb(100,0,0)'},
                      inactive: {base: 'rgb(100,0,0)',hover:'rgb(0,70,0)'}
                    }}
                    onToggle={(value) => {
                      this.setState({value: !value,});
                      document.getElementById("clickSelect").value=!value;
                    }} />
                  </div>
                  <div style={{position:'relative',top:'-50px',left:'220px'}}>
                    {"Max Orders Loaded"}
                    <input id ="maxNumOrders" type="number"min="0" pattern="^\d*\s*$"style={{marginLeft:"10px",marginRight:"25px",width:"100px",marginTop:"3px"}}/>
                    <input id ="minTimeOrders" type="number"min="0" pattern="^\d*\s*$"style={{marginLeft:"10px",marginRight:"10px",width:"100px",marginTop:"3px"}}/>
                    {" ≤ Countdown Days ≤ "}
                    <input id ="maxTimeOrders" type="number"min="0" pattern="^\d*\s*$"style={{marginLeft:"10px",marginRight:"10px",width:"100px",marginTop:"3px"}}/>
                    <div style={{position:'relative',left:'690px',top:'-30px'}}>
                      <Button as="input"type ="Button"value="↻"onClick={this.handleBounty} style={{color:"yellow",fontWeight:'bold',padding:"2px",paddingLeft:"7px",paddingBottom:"7px",
                        paddingRight:"7px",fontSize:'25px',borderRadius:"100px",lineHeight:'0em',backgroundColor:"#3471eb",marginLeft:"30px",width:"20x",height:"35px",marginBottom:"8px"}}/>
                    </div>
                  </div>
                </div>
                <hr style={{marginTop:"-70px",borderColor:"#4e8eca"}}></hr>
                <hr style={{marginTop:"-30px",borderColor:"#4e8eca",position:'relative',top:'45px'}}></hr>
                <AgGridReact
                  id="grid"
                  rowData={this.list}
                  suppressDragLeaveHidesColumns={true}
                  enableCellTextSelection={true}
                  ensureDomOrder={true}
                  cellStyle={{color: 'red'}}
                  rowHeight={"30"}
                  rowSelection={"single"}
                  onRowClicked={(e)=>{
                    if(document.getElementById("clickSelect").value){
                      this.rowSelected(e);
                    }
                  }}
                  >
                    {/*wrapText={true}*/}
                    {/* alt 18 = ↕ arrow symbol*/}
                    <AgGridColumn field="Countdown ↕"sortable={true}maxWidth={"160"}></AgGridColumn>
                    <AgGridColumn field="Bounty ↕"sortable={true}maxWidth={"120"}></AgGridColumn>
                    <AgGridColumn field="Epoch Time ↕"sortable={true}maxWidth={"110"}></AgGridColumn>
                    <AgGridColumn field="Amount ↕"sortable={true}maxWidth={"120"}></AgGridColumn>
                    <AgGridColumn field="Time"sortable={true}maxWidth={"170"}></AgGridColumn>
                    <AgGridColumn field="Sender"sortable={true}maxWidth={"150"}></AgGridColumn>
                    <AgGridColumn field="Receiver"sortable={true}maxWidth={"150"}></AgGridColumn>
                    <AgGridColumn field="Finalized?"sortable={true}maxWidth={"90"}></AgGridColumn>
                </AgGridReact>
              </div>
              {/*<div class="verticalLine" style={{marginTop:"-107.5vh",height:"90vh",position:'relative',left:'353px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>
              <div class="verticalLine" style={{marginTop:"-90vh",height:"90vh",position:'relative',left:'477px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>
              <div class="verticalLine" style={{marginTop:"-90vh",height:"90vh",position:'relative',left:'587px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>
              <div class="verticalLine" style={{marginTop:"-90vh",height:"90vh",position:'relative',left:'707px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>
              <div class="verticalLine" style={{marginTop:"-90vh",height:"90vh",position:'relative',left:'877px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>
              <div class="verticalLine" style={{marginTop:"-90vh",height:"90vh",position:'relative',left:'1027px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>
              <div class="verticalLine" style={{marginTop:"-90vh",height:"90vh",position:'relative',left:'1177px',top:"108px",borderLeft:"1px solid #4e8eca"}}></div>*/}
          </div>
        </h7>
        {/*<div id="footer"style={{backgroundColor:"#fff063",minHeight:"9vh",textAlign:"center"}}>
        </div>*/}
      </div>
    )
  }
}
export default App;
