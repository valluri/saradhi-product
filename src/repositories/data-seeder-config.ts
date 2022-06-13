import { Context } from 'moleculer';
import { DataSeederHelper, RepositoryBase } from '@valluri/saradhi-library';

export class ConfigDataSeeder extends RepositoryBase {
	public static async seed(ctx: Context, connInfoList: any[], platformEntities: any[], tenantEntities: any[]) {
		ctx.broker.logger.info('++config seed');

		await ConfigDataSeeder.seedAndCreateTenantDbs(ctx, connInfoList, tenantEntities);
		await RepositoryBase.init(connInfoList, platformEntities, tenantEntities);

		// await RepositoryBaseO.init(connInfoList, platformEntities, tenantEntities);
		// // address
		// await this.seedAddresses(ctx);
		// ctx.broker.logger.info('addresses seeded');

		// // seed reports config
		// await this.seedReports(ctx);
		// ctx.broker.logger.info('Reports seeded');

		// // jobs
		// await this.seedSchedulerJobs(ctx);
		// ctx.broker.logger.info('scheduler jobs seeded');

		// // Q
		// await this.seedQs(ctx);
		// ctx.broker.logger.info('queues seeded');

		ctx.broker.logger.info('--config seed');
	}

	private static async seedAndCreateTenantDbs(ctx: Context, connInfoList: any[], tenantEntities: any[]) {
		for await (const t of connInfoList) {
			await DataSeederHelper.createTenantDb(ctx, t, tenantEntities);
		}
	}
}
