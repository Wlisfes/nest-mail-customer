import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm'
import { Logger } from '@server/modules/logger/logger.service'
import { fetchSelection } from '@server/utils/utils-schema'
import * as schema from '@server/modules/database/database.schema'

@Injectable()
export class DatabaseService extends Logger {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(schema.SchemaUser) public readonly schemaUser: Repository<schema.SchemaUser>
    ) {
        super()
    }

    /**条件SQL组合**/
    public async fetchBrackets(where: boolean, handler?: Function) {
        if (where && handler) {
            return await handler(where)
        }
        return where
    }

    /**字段查询输出组合**/
    public async fetchSelection<T>(qb: SelectQueryBuilder<T>, keys: Array<[string, Array<string>]>) {
        const fields = new Set(keys.map(([alias, names]) => fetchSelection(alias, names)).flat(Infinity)) as never as Array<string>
        return await qb.select([...fields])
    }

    /**typeorm事务**/
    public async fetchTransactionRunner(start: boolean = true) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        if (start) {
            await queryRunner.startTransaction()
        }
        return queryRunner
    }

    /**自定义查询**/
    public async fetchConnectBuilder<T, R>(model: Repository<T>, callback: (qb: SelectQueryBuilder<T>) => Promise<R>) {
        const qb = model.createQueryBuilder('t')
        return await callback(qb)
    }
}
