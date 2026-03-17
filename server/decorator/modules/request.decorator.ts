import { ApiOperationOptions, ApiResponseOptions, getSchemaPath, ApiExtraModels } from '@nestjs/swagger'
import { ApiOperation, ApiConsumes, ApiProduces, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { applyDecorators, Type } from '@nestjs/common'
import { ApiGuardReflector, AuthOptions } from '@server/guard'

export interface OptionDecorator {
    /**接口描述**/
    operation: ApiOperationOptions
    /**接口响应描述**/
    response: ApiResponseOptions
    /**分页列表类型**/
    customize: { status: number; description: string; type: Type<unknown> }
    /**登录校验**/
    authorize: AuthOptions
    /**入参类型定义**/
    consumes: string[]
    /**出类型定义**/
    produces: string[]
}

export function ApiServiceDecorator(mthodRequest: MethodDecorator, options: Partial<OptionDecorator> = {}) {
    const consumes = options.consumes ?? ['application/json']
    const produces = options.produces ?? ['application/json', 'application/xml']
    const decorators: Array<any> = [mthodRequest, ApiOperation(options.operation), ApiConsumes(...consumes), ApiProduces(...produces)]

    if (options.customize) {
        decorators.push(
            ApiExtraModels(options.customize.type),
            ApiResponse({
                status: options.customize.status,
                description: options.customize.description,
                schema: {
                    allOf: [
                        {
                            properties: {
                                page: { type: 'number', default: 1 },
                                size: { type: 'number', default: 10 },
                                total: { type: 'number', default: 0 },
                                list: {
                                    type: 'array',
                                    items: { $ref: getSchemaPath(options.customize.type) }
                                }
                            }
                        }
                    ]
                }
            })
        )
    } else {
        decorators.push(ApiResponse(options.response))
    }

    /**开启登录校验**/
    if (options.authorize) {
        decorators.push(ApiBearerAuth('authorization'), ApiGuardReflector(options.authorize))
    }

    return applyDecorators(...decorators)
}
