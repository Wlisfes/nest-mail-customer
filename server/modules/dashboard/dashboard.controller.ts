import { Post, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { DashboardService } from '@server/modules/dashboard/dashboard.service'
import * as dto from '@server/interface'

@ApifoxController('仪表盘模块', '/api/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @ApiServiceDecorator(Post('/stats'), {
        operation: { summary: '统计卡片数据' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchDashboardStats(@Request() request: dto.OmixRequest) {
        return await this.dashboardService.httpFetchDashboardStats(request)
    }

    @ApiServiceDecorator(Post('/trend'), {
        operation: { summary: '7天趋势数据' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchDashboardTrend(@Request() request: dto.OmixRequest) {
        return await this.dashboardService.httpFetchDashboardTrend(request)
    }

    @ApiServiceDecorator(Post('/distribution'), {
        operation: { summary: '邮箱分布数据' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchDashboardDistribution(@Request() request: dto.OmixRequest) {
        return await this.dashboardService.httpFetchDashboardDistribution(request)
    }
}
