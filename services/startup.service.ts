import { Address, RepositoryBase, ServiceBase, Utility } from '@valluri/saradhi-library';
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

@Service({
	name: 'productStartup',
	version: 1,
})
export default class StartupService extends ServiceBase {
	private static DATA_SEEDING: string = 'isProductDataSeeding';

	public async started() {
		console.log(`Connecting to DB at ${process.env.TYPEORM_HOST}:${process.env.TYPEORM_PORT}`);

		this.setEntitiesMethod();
		await RepositoryBase.getConnection();

		if (Utility.getEnv('SEED_DATA', 'true') == 'true') {
			this.broker.waitForServices(['v1.systemSetting']).then(async () => {
				await this.triggerSeedMethod();
			});
		}
	}

	@Action({
		security: {
			noChecks: true,
		},
	})
	public async triggerSeed(ctx: Context) {
		this.triggerSeedMethod();
	}

	@Action({
		security: {
			noChecks: true,
		},
	})
	public getServerTime(ctx: Context): Date {
		return new Date();
	}

	@Event({
		name: '$broker.stopped',
	})
	private async stop() {
		await RepositoryBase.closeConnection();
	}

	@Method
	private async triggerSeedMethod() {
		try {
			// *check if seeding started
			let setting: string | undefined | boolean = await this.broker.call('v1.systemSetting.get', { name: StartupService.DATA_SEEDING });
			setting = setting && +setting ? true : false;

			if (setting) {
				this.broker.logger.info('test data seeding already started !');
				return;
			}

			// *test data seed flag set to true
			await this.broker.call('v1.systemSetting.set', { name: StartupService.DATA_SEEDING, value: '1' });

			this.broker.logger.info('seed started');

			const ctx: Context = this.broker.ContextFactory.create(this.broker);

			if (!Utility.isProduction()) {
				await TestDataSeeder.seed(ctx);
			}

			await ConfigDataSeeder.seed(ctx);

			// *test data seed flag reset to false for next time container start
			await this.broker.call('v1.systemSetting.set', { name: StartupService.DATA_SEEDING, value: '0' });
			this.broker.logger.info('seed completed');
		} catch (err) {
			console.log(err);
			await this.broker.call('v1.systemSetting.set', { name: StartupService.DATA_SEEDING, value: '0' });
		}
	}

	@Method
	private setEntitiesMethod() {
		RepositoryBase.entities = [
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
		];
	}
}

module.exports = StartupService;
