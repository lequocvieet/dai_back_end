import { Injectable } from '@nestjs/common';
import { ethers, Signer } from 'ethers';
import { ContractFactory } from 'ethers';
import GemJoinAbi from '../abis/dai/liquidation-auction-module/join.sol/GemJoin.json';
import BatAbi from '../abis/BAT.json';
import BatAddress from '../abis/BAT-address.json';
import DS_RolesAbi from '../abis/DSRoles.json';
import DS_RolesAddress from '../abis/DSRoles-address.json';
import VatAbi from '../abis/Vat.json'
import VatAddress from '../abis/Vat-address.json'
import { Interface } from 'readline';
import { DeployGemRequestDTO } from './dto/deployGemRequestDTO';
import { FundRequestDTO } from './dto/fundRequestDTO';
import { AuthRequestDTO } from './dto/authRequestDTO';

@Injectable()
export class AppService {
  privateKey = process.env.CONTRACT_OWNER_HARDHAT_API_KEY;
  hardhat_node_provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
  //ganache_node_provider=new ethers.JsonRpcProvider('http://127.0.0.1:8545')
  //contractOwner = new ethers.Wallet(this.privateKey, this.hardhat_node_provider);
  contractOwner = new ethers.Wallet(this.privateKey, this.hardhat_node_provider);
  delay = ms => new Promise(res => setTimeout(res, ms));

  getHello(): string {
    return 'Hello World!';
  }

  async deployGemJoin(data: DeployGemRequestDTO): Promise<string> {
    const GemJoin = new ContractFactory(
      GemJoinAbi.abi,
      GemJoinAbi.bytecode,
      this.contractOwner,
    );
    const gemJoin = await GemJoin.deploy(
      data.vatAddress,
      data.priceType,
      data.batAddress,
    );

    const Vat =new ethers.Contract(
      VatAddress.address,
      VatAbi.abi,
      this.contractOwner
    )
    //Authorize for gemJoin to call vat
    //ToDO: increase nonce instead of wait 1s for transaction confirmation 
    await this.delay(1000);
    console.log("Waited 1s");
    await Vat.rely(gemJoin.getAddress());

    const gemJoinAddress = await gemJoin.getAddress();
    return gemJoinAddress;
  }

  async requestAuth(data: AuthRequestDTO): Promise<string> {
    const ds_roles = new ethers.Contract(
      DS_RolesAddress.address,
      DS_RolesAbi.abi,
      this.contractOwner,
    );
    //Grant  authorized permission for requester
    //ToDo: switch case for each permission type
    //For simplicity HardFix root-user type
    const nonce2 = await this.hardhat_node_provider.getTransactionCount(DS_RolesAddress.address);
    console.log("nonce",nonce2)
    await ds_roles.setRootUser(data.requester, true);
    
    //ToDo: Check Permission
    //to know auth requets is success or not
    await this.delay(1000);
    console.log("Waited 1s");
    return 'auth ok';
  }

  async requestFund(data: FundRequestDTO): Promise<string> {
    //Todo: switch case for each gem Token
    //For simplicity just hardfix gemToken is Bat token
    const bat = new ethers.Contract(
      BatAddress.address,
      BatAbi.abi,
      this.contractOwner,
    );
    const receiverBalanceBefore = await bat.getAddressBalance(data.receiver);
    const nonce1 = await this.hardhat_node_provider.getTransactionCount( BatAddress.address);
    console.log("nonce ",nonce1)

    await bat.setAuthority(DS_RolesAddress.address)
    await this.delay(1000);
    console.log("Waited 1s");
    await bat.mintz(data.receiver, ethers.parseEther(data.amount));
    const receiverBalanceAfter = await bat.getAddressBalance(data.receiver);
    const myResult = receiverBalanceAfter.toString();
    //ToDo: Compare balance before and after Fund
    //to know fund requets is success or not
    if(myResult != receiverBalanceBefore.toString()){
      return myResult;
    }else{
      return "fund failed";
    }
  }
}


