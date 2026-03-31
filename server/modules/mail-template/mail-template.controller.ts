import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailTemplateService } from '@server/modules/mail-template/mail-template.service'
import * as dto from '@server/interface'

@ApifoxController('邮件模板模块', '/api/mail-template')
export class MailTemplateController {
    constructor(private readonly mailTemplateService: MailTemplateService) {}

    @ApiServiceDecorator(Post('/list'), {
        authorize: true,
        operation: { summary: '模板列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchTemplates(@Request() request: dto.OmixRequest, @Body() body: { categoryId?: number }) {
        return await this.mailTemplateService.httpFetchTemplates(request, body)
    }

    @ApiServiceDecorator(Post('/detail'), {
        authorize: true,
        operation: { summary: '模板详情' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchTemplateDetail(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailTemplateService.httpFetchTemplateDetail(request, body.keyId)
    }

    @ApiServiceDecorator(Post('/save'), {
        authorize: true,
        operation: { summary: '保存模板' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSaveTemplate(@Request() request: dto.OmixRequest, @Body() body: dto.SaveTemplateOptions) {
        return await this.mailTemplateService.httpSaveTemplate(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        authorize: true,
        operation: { summary: '删除模板' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteTemplate(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailTemplateService.httpDeleteTemplate(request, body.keyId)
    }

    @ApiServiceDecorator(Post('/copy'), {
        authorize: true,
        operation: { summary: '复制模板' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCopyTemplate(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailTemplateService.httpCopyTemplate(request, body.keyId)
    }

    @ApiServiceDecorator(Post('/compile'), {
        authorize: true,
        operation: { summary: '编译MJML' },
        response: { status: 200, description: 'OK' }
    })
    public async httpCompileTemplate(@Request() request: dto.OmixRequest, @Body() body: { mjmlSource: string }) {
        return await this.mailTemplateService.httpCompileTemplate(request, body)
    }

    @ApiServiceDecorator(Post('/send'), {
        authorize: true,
        operation: { summary: '模板发送' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSendTemplate(@Request() request: dto.OmixRequest, @Body() body: dto.SendTemplateOptions) {
        return await this.mailTemplateService.httpSendTemplate(request, body)
    }
}
