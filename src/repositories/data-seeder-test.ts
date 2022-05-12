import { JourneyType, ProductCategory, RepositoryBase, DataSeederHelper } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { Partner } from '@Entities/partner/partner';
import { LendingProductConfigKeys } from '@ServiceHelpers/product-config-keys';
import { Product } from '@Entities/product/product';
import { ProductConfig } from '@Entities/product/product-config';

export class TestDataSeeder extends RepositoryBase {
	public static async seed(ctx: Context) {
		ctx.broker.logger.info('test data seed started');

		await TestDataSeeder.seedPartners(ctx);

		await TestDataSeeder.seedProducts(ctx);

		ctx.broker.logger.info('test data seed done');
	}

	private static async seedPartners(ctx: Context) {
		ctx.broker.logger.info('partner seed started');

		await TestDataSeeder.seedPartner(ctx, 'RBL', 'RBL');
		await TestDataSeeder.seedPartner(ctx, 'Axis Bank ', 'AB');

		ctx.broker.logger.info('partner seed done');
	}

	private static async seedPartner(ctx: Context, name: string, code: string) {
		const query = { where: { code, deleted: false } };
		const partner = new Partner();
		partner.name = name;
		partner.code = code;

		await DataSeederHelper.seedItem<Partner>(Partner, query, partner);
	}

	private static async seedProducts(ctx: Context) {
		ctx.broker.logger.info('product seed started');

		await TestDataSeeder.seedProduct(ctx, 'RBL-MFI', 'RBL');
		await TestDataSeeder.seedProduct(ctx, 'AB-MFI', 'AB');

		ctx.broker.logger.info('product seed done');
	}

	private static async seedProduct(ctx: Context, code: string, partnerCode: string) {
		const partner: Partner = await DataSeederHelper.getItem<Partner>(Partner, { where: { code: partnerCode } });
		const query = { where: { code, partnerId: partner.id!, deleted: false } };

		let p = new Product();
		p.code = code;
		p.partnerId = partner.id!;
		p = await DataSeederHelper.seedItem<Product>(Product, query, p);

		const minAmount: number = Math.floor(Math.random() * 100);
		await TestDataSeeder.seedProductConfig(ctx, p.id!, LendingProductConfigKeys.LendingProductConfig.CbCheckRequired, false);
		await TestDataSeeder.seedProductConfig(ctx, p.id!, LendingProductConfigKeys.LendingProductConfig.LoanAmountMin, minAmount);
		await TestDataSeeder.seedProductConfig(
			ctx,
			p.id!,
			LendingProductConfigKeys.LendingProductConfig.LoanAmountMax,
			minAmount + Math.floor(Math.random() * 100),
		);
	}

	private static async seedProductConfig(ctx: Context, productId: string, key: string, value: any) {
		const query = { where: { productId, key } };
		const t = new ProductConfig();
		t.key = key;
		t.value = value.toString();

		await DataSeederHelper.seedItem(ProductConfig, query, t);
	}

	private static async seedProductConfigs(ctx: Context, productCode: string) {
		const query = { where: { code: productCode, deleted: false } };

		const product = await RepositoryBase.getResource(ctx, Product, query);
		const productId = product.id!;

		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.AgeMin, 18);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.AgeMax, 65);

		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.CbScoreMin, 100);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.CbScoreMax, 700);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.CbAllowNewToCredit, true);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.CbUseCrif, true);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.CbUseCibil, true);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.CbUseExperian, false);

		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.LoanAmountMin, 10000);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.LoanAmountMax, 1000000);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.LoanAmountStep, 10000);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.LoanTenureMin, 12);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.LoanTenureMax, 36);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.LoanTenureStep, 3);

		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.KycUseManual, true);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.KycUseElectronic, true);
		await this.seedProductConfig(ctx, productId, LendingProductConfigKeys.LendingProductConfig.KycUseVideo, true);
	}
}
