import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailTemplateVariableService } from '@server/modules/mail-template-variable/mail-template-variable.service'
import * as dto from '@server/interface'

@ApifoxController('模板变量模块', '/api/mail-template-variable')
export class MailTemplateVariableController {
    constructor(private readonly mailTemplateVariableService: MailTemplateVariableService) {}

    @ApiServiceDecorator(Post('/list'), {
        authorize: true,
        operation: { summary: '获取变量列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchVariables(@Request() request: dto.OmixRequest) {
        return await this.mailTemplateVariableService.httpFetchVariables(request)
    }

    @ApiServiceDecorator(Post('/save'), {
        authorize: true,
        operation: { summary: '保存变量' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSaveVariable(@Request() request: dto.OmixRequest, @Body() body: dto.SaveVariableOptions) {
        return await this.mailTemplateVariableService.httpSaveVariable(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        authorize: true,
        operation: { summary: '删除变量' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteVariable(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailTemplateVariableService.httpDeleteVariable(request, body.keyId)
    }
}
