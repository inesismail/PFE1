import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignalProcessorService } from './signal-processor.service';

@ApiTags('Signal Processor')
@Controller('signal-processor')
export class SignalProcessorController {
  constructor(private readonly service: SignalProcessorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get processing status for all connections' })
  getStatus() { return this.service.getProcessingStatus(); }

  @Post('trigger/:connectionId')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Manually trigger signal processing' })
  trigger(@Param('connectionId') connectionId: string) {
    // Run async, don't wait — comme le monolithe
    this.service.processConnectionSignals(connectionId).catch((err) => {
      console.error('Manual trigger failed:', err);
    });
    return { message: 'Processing triggered', connectionId, triggeredAt: new Date() };
  }

  @Put(':connectionId/interval')
  @ApiOperation({ summary: 'Update fetch interval' })
  async updateInterval(
    @Param('connectionId') connectionId: string,
    @Body('intervalMinutes') intervalMinutes: number,
  ) {
    await this.service.updateFetchInterval(connectionId, intervalMinutes);
    return { message: 'Interval updated', connectionId, intervalMinutes };
  }

  @Put(':connectionId/enabled')
  @ApiOperation({ summary: 'Enable/disable fetch job' })
  async setEnabled(
    @Param('connectionId') connectionId: string,
    @Body('enabled') enabled: boolean,
  ) {
    await this.service.setFetchEnabled(connectionId, enabled);
    return { message: enabled ? 'Fetching enabled' : 'Fetching disabled', connectionId, enabled };
  }
}
