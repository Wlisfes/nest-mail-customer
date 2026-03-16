import { Controller } from '@nestjs/common'

/**动态前缀控制器**/
export function WithController(prefix: string): ClassDecorator {
    return (target: any) => {
        Controller(`api/v1/${prefix}`)(target)
    }
}
