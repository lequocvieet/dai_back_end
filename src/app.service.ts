import { Injectable } from '@nestjs/common';
import { ethers, Signer } from 'ethers';
import { ContractFactory } from 'ethers';
import GemJoinAbi from '../abis/dai/liquidation-auction-module/join.sol/GemJoin.json';
import BatAbi from '../abis/BAT.json';
import BatAddress from '../abis/BAT-address.json';
import DS_RolesAbi from '../abis/DSRoles.json';
import DS_RolesAddress from '../abis/DSRoles-address.json';
import { Interface } from 'readline';
import { DeployGemRequestDTO } from './dto/deployGemRequestDTO';
import { FundRequestDTO } from './dto/fundRequestDTO';
import { AuthRequestDTO } from './dto/authRequestDTO';

@Injectable()
export class AppService {
  privateKey = process.env.CONTRACT_OWNER_API_KEY;
  node_provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545/');
  contractOwner = new ethers.Wallet(this.privateKey, this.node_provider);

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
    //Authorize for gemJoin to call vat
    //await vat.connect(account0).rely(gemJoin.address);

    const gemJoinAddress = await gemJoin.getAddress();
    return gemJoinAddress;
  }

  async requestFund(data: FundRequestDTO): Promise<string> {
    //Todo: switch case for each gem Token
    //For simplicity just hardfix gemToken is Bat token

    const bat = new ethers.Contract(
      BatAddress.address,
      BatAbi.abi,
      this.contractOwner,
    );
    await bat.mintz(data.receiver, ethers.parseEther(data.amount));
    //ToDo: Copare balance before and after Fund
    //to know fund requets is success or not
    return 'ok';
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
    await ds_roles.setRootUser(data.requester, true);
    //ToDo: Check Permission
    //to know auth requets is success or not
    return 'ok';
  }
}
