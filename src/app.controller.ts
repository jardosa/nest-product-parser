import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/parse')
  async executeParse(): Promise<void> {
    return this.appService.executeParse();
  }
}
