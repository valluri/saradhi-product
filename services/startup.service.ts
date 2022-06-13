import { Address, RepositoryBase, ServiceBase, TokenRequiredType, Utility } from '@valluri/saradhi-library';
import { Action, Event, Method, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { TestDataSeeder } from '@Repositories/data-seeder-test';
import { ConfigDataSeeder } from '@Repositories/data-seeder-config';
import { Partner } from '@Entities/partner/partner';
import { PartnerContact } from '@Entities/partner/partner-contact';
import { Product } from '@Entities/product/product';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ProductPreference } from '@Entities/product/product-preference';
import { Stage } from '@Entities/product/stage';
import { ProductStage } from '@Entities/product/product-stage';
import { LoanRequest } from '@Entities/loan-request';
import { PersonInfo } from '@Entities/person-info';
import { BusinessInfo } from '@Entities/business-info';
import { Jlg } from '@Entities/loan-journey/jlg';

@Service({
	name: 'productStartup',
	version: 1,
})
export default class StartupService extends ServiceBase {
	private static PRODUCT_DATA_SEEDING: string = 'isProductDataSeeding';

	public async started() {
		console.log(`Connecting to DB at ${process.env.TYPEORM_HOST}:${process.env.TYPEORM_PORT}`);

		this.broker.waitForServices(['v1.systemSetting', 'v1.auth', 'v1.serviceLog', 'v1.connectionInfo']).then(async () => {
			await this.seedMethod();
		});
	}

	@Action({
		security: {
			tokenRequired: TokenRequiredType.NotRequired,
		},
	})
	public async triggerSeed(ctx: Context) {
		this.seedMethod();
	}

	@Action({
		security: {
			tokenRequired: TokenRequiredType.NotRequired,
		},
	})
	public getServerTime(ctx: Context): Date {
		return new Date();
	}

	@Event({
		name: '$broker.stopped',
	})
	private async stop() {
		await RepositoryBase.closeDataSources();
	}

	@Event({
		name: 'productSeeding.complete',
	})
	private async initConnections(ctx: Context) {
		const connInfoList: any[] = await ctx.call('v1.connectionInfo.get');
		await RepositoryBase.init(connInfoList, this.getPlatformEntitiesMethod(), this.getTenantEntitiesMethod());
	}

	@Method
	private async seedMethod() {
		if (Utility.getEnv('SEED_DATA', 'true') !== 'true') {
			this.broker.emit('productSeeding.complete');
			return;
		}
		const ctx: Context = this.broker.ContextFactory.create(this.broker);
		(ctx.meta as any).tenantCode = '';

		try {
			// *check if seeding started

			let setting: string | undefined | boolean = await ctx.call('v1.systemSetting.get', { name: StartupService.PRODUCT_DATA_SEEDING });
			setting = setting && +setting ? true : false;

			if (setting) {
				ctx.broker.logger.info('test data seeding already started !');
				return;
			}

			// *test data seed flag set to true
			await ctx.call('v1.systemSetting.set', { name: StartupService.PRODUCT_DATA_SEEDING, value: '1' });
			ctx.broker.logger.info('seed started');

			// seed config data first
			const connInfoList: any[] = await ctx.call('v1.connectionInfo.get');
			await ConfigDataSeeder.seed(ctx, connInfoList, this.getPlatformEntitiesMethod(), this.getTenantEntitiesMethod());
			await TestDataSeeder.seed(ctx);

			// *test data seed flag reset to false for next time container start
			await ctx.call('v1.systemSetting.set', { name: StartupService.PRODUCT_DATA_SEEDING, value: '0' });
			ctx.broker.logger.info('seed completed');
		} catch (err) {
			console.log(err);
			await ctx.call('v1.systemSetting.set', { name: StartupService.PRODUCT_DATA_SEEDING, value: '0' });
		}
		ctx.emit('productSeeding.complete');
	}

	@Method
	private getTenantEntitiesMethod(): any[] {
		return [
			Address,
			Partner,
			PartnerContact,
			Product,
			ProductConfig,
			ProductDocument,
			ProductPreference,
			Stage,
			ProductStage,
			LoanRequest,
			PersonInfo,
			BusinessInfo,
			Jlg,
		];
	}

	@Method
	private getPlatformEntitiesMethod(): any[] {
		return [];
	}
}

module.exports = StartupService;
