import { Context } from 'moleculer';
import { DataSeederHelper, ProductCategory, RepositoryBase } from '@valluri/saradhi-library';
import { ProductConfig } from '@Entities/product-config';
import { LendingProductConfigKeys } from '@ServiceHelpers/product-config-keys';
import { Product } from '@Entities/product';

export class ConfigDataSeeder extends RepositoryBase {
	public static async seed(ctx: Context) {
		ctx.broker.logger.info('config seed started');

		await ConfigDataSeeder.seedProducts(ctx);

		try {
			await ConfigDataSeeder.seedProductConfigs(ctx);
		} catch (e) {
			console.log(e);
		}

		ctx.broker.logger.info('config seed done');
	}

	private static async seedProducts(ctx: Context) {
		ctx.broker.logger.info('product seed started');

		await this.seedProduct(ctx, 'MSME', 'MSME', ProductCategory.MsmeLoan);
		// await this.seedProduct(ctx, '2 Wheeler', '2W', ProductCategory.LoanLead);
		// await this.seedProduct(ctx, '4 Wheeler', '4W', ProductCategory.LoanLead);
		// await this.seedProduct(ctx, 'Housing Loan', 'HL', ProductCategory.LoanLead);
		// await this.seedProduct(ctx, 'Gold Loan', 'GL', ProductCategory.LoanLead);

		ctx.broker.logger.info('product seed done');
	}

	private static async seedProduct(ctx: Context, name: string, code: string, productCategory: ProductCategory): Promise<Product> {
		const query = { where: { code, deleted: false } };
		const p = new Product();
		p.name = name;
		p.code = code;
		p.category = productCategory;

		return await DataSeederHelper.seedItem<Product>(Product, query, p);
	}

	private static async seedProductConfigs(ctx: Context) {
		const query = { where: { code: 'MSME', deleted: false } };

		const p = await RepositoryBase.getResource(ctx, Product, query);

		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.AgeMin, 18);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.AgeMax, 65);

		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.CbScoreMin, 100);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.CbScoreMax, 700);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.CbAllowNewToCredit, true);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.CbUseCrif, true);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.CbUseCibil, true);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.CbUseExperian, false);

		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.LoanAmountMin, 10000);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.LoanAmountMax, 1000000);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.LoanAmountStep, 10000);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.LoanTenureMin, 12);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.LoanTenureMax, 36);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.LoanTenureStep, 3);

		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.KycUseManual, true);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.KycUseElectronic, true);
		await this.seedProductConfig(ctx, p, LendingProductConfigKeys.LendingProductConfig.KycUseVideo, true);
	}

	private static async seedProductConfig(ctx: Context, product: Product, key: string, defaultValue: any, description: string = '') {
		let query = { where: { productId: product.id!, key, deleted: false } };
		const productConfig = new ProductConfig();
		productConfig.productId = product.id!;
		productConfig.key = key;
		productConfig.defaultValue = defaultValue;
		productConfig.description = description;

		await DataSeederHelper.seedItem<ProductConfig>(ProductConfig, query, productConfig);
	}
}
