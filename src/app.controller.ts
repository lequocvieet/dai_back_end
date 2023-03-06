import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DeployGemRequestDTO } from './dto/deployGemRequestDTO';
import { FundRequestDTO } from './dto/fundRequestDTO';
import { AuthRequestDTO } from './dto/authRequestDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/deployGem')
  async deployGemJoin(@Body() data: DeployGemRequestDTO): Promise<string> {
    console.log(data);
    const response = await this.appService.deployGemJoin(data);
    const jsonResponse = JSON.stringify(response);
    return jsonResponse;
  }

  @Post('/requestFund')
  async requestFund(@Body() data: FundRequestDTO): Promise<string> {
    console.log(data);
    const response = await this.appService.requestFund(data);
    const jsonResponse = JSON.stringify(response);
    return jsonResponse;
  }

  @Post('/requestAuth')
  async requestAuth(@Body() data: AuthRequestDTO): Promise<string> {
    console.log(data);
    const response = await this.appService.requestAuth(data);
    const jsonResponse = JSON.stringify(response);
    return jsonResponse;
  }
}
