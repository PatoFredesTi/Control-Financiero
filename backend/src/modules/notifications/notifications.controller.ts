import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('center')
  getCenter(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('daysAhead') daysAhead?: string,
    @Query('severity') severity?: string,
    @Query('category') category?: string,
  ) {
    return this.notificationsService.getNotificationCenter({ month, year, daysAhead, severity, category });
  }

  @Get('summary')
  getSummary(@Query('month') month?: string, @Query('year') year?: string, @Query('daysAhead') daysAhead?: string) {
    return this.notificationsService.getSummary({ month, year, daysAhead });
  }
}
