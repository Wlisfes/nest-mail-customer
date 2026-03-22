import { Module } from '@nestjs/common'
import { DashboardService } from '@server/modules/dashboard/dashboard.service'
import { DashboardController } from '@server/modules/dashboard/dashboard.controller'

@Module({
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService]
})
export class DashboardModule {}
