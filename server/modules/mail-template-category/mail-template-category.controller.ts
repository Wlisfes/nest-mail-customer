import { Post, Body, Request } from '@nestjs/common'
import { ApifoxController, ApiServiceDecorator } from '@server/decorator'
import { MailTemplateCategoryService } from '@server/modules/mail-template-category/mail-template-category.service'
import * as dto from '@server/interface'

@ApifoxController('模板分类模块', '/api/mail-template-category')
export class MailTemplateCategoryController {
    constructor(private readonly mailTemplateCategoryService: MailTemplateCategoryService) {}

    @ApiServiceDecorator(Post('/list'), {
        authorize: true,
        operation: { summary: '获取分类列表' },
        response: { status: 200, description: 'OK' }
    })
    public async httpFetchCategories(@Request() request: dto.OmixRequest) {
        return await this.mailTemplateCategoryService.httpFetchCategories(request)
    }

    @ApiServiceDecorator(Post('/save'), {
        authorize: true,
        operation: { summary: '保存分类' },
        response: { status: 200, description: 'OK' }
    })
    public async httpSaveCategory(@Request() request: dto.OmixRequest, @Body() body: dto.SaveCategoryOptions) {
        return await this.mailTemplateCategoryService.httpSaveCategory(request, body)
    }

    @ApiServiceDecorator(Post('/delete'), {
        authorize: true,
        operation: { summary: '删除分类' },
        response: { status: 200, description: 'OK' }
    })
    public async httpDeleteCategory(@Request() request: dto.OmixRequest, @Body() body: { keyId: number }) {
        return await this.mailTemplateCategoryService.httpDeleteCategory(request, body.keyId)
    }
}
