import { JourneyType, ProductCategory, RepositoryBase, DataSeederHelper } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { ProductPartner } from '@Entities/product-partner';
import { Partner } from '@Entities/partner';
import { ProductPartnerConfig } from '@Entities/product-partner-config';
import { LendingProductConfigKeys } from '@ServiceHelpers/product-config-keys';
import { Product } from '@Entities/product';

export class TestDataSeeder extends RepositoryBase {
	public static async seed(ctx: Context) {
		ctx.broker.logger.info('test data seed started');

		await TestDataSeeder.seedPartners(ctx);

		await TestDataSeeder.seedProductPartners(ctx);

		ctx.broker.logger.info('test data seed done');
	}

	private static async seedPartners(ctx: Context) {
		ctx.broker.logger.info('partner seed started');
		await TestDataSeeder.seedPartner(ctx, 'ICICI', 'ICICI');
		await TestDataSeeder.seedPartner(ctx, 'Axis Bank ', 'AB');
		await TestDataSeeder.seedPartner(ctx, 'Neo Growth', 'NG');
		await TestDataSeeder.seedPartner(ctx, 'Samunnati', 'Samunnati');
		ctx.broker.logger.info('partner seed done');
	}

	private static async seedPartner(ctx: Context, name: string, code: string) {
		const query = { where: { code, deleted: false } };
		const partner = new Partner();
		partner.name = name;
		partner.code = code;

		await DataSeederHelper.seedItem<Partner>(Partner, query, partner);
	}

	private static async seedProductPartners(ctx: Context) {
		ctx.broker.logger.info('product partner seed started');
		await TestDataSeeder.seedProductPartner(ctx, '2W', 'ICICI', JourneyType.LeadOnly);
		await TestDataSeeder.seedProductPartner(ctx, '2W', 'AB', JourneyType.LeadOnly);
		await TestDataSeeder.seedProductPartner(ctx, 'MSME', 'NG', JourneyType.Full);
		await TestDataSeeder.seedProductPartner(ctx, 'Agri', 'Samunnati', JourneyType.Full);
		ctx.broker.logger.info('product partner seed done');
	}

	private static async seedProductPartner(ctx: Context, productCode: string, partnerCode: string, productPartnerType: JourneyType) {
		const query = { where: { productCode, partnerCode, deleted: false } };
		let p = new ProductPartner();
		p.productCode = productCode;
		p.partnerCode = partnerCode;
		p.type = productPartnerType;
		p = await DataSeederHelper.seedItem<ProductPartner>(ProductPartner, query, p);

		const minAmount: number = Math.floor(Math.random() * 100);
		await TestDataSeeder.seedPartnerProductConfig(ctx, p.id!, LendingProductConfigKeys.LendingProductConfig.CbCheckRequired, false);
		await TestDataSeeder.seedPartnerProductConfig(ctx, p.id!, LendingProductConfigKeys.LendingProductConfig.LoanAmountMin, minAmount);
		await TestDataSeeder.seedPartnerProductConfig(
			ctx,
			p.id!,
			LendingProductConfigKeys.LendingProductConfig.LoanAmountMax,
			minAmount + Math.floor(Math.random() * 100),
		);
	}

	private static async seedPartnerProductConfig(ctx: Context, productPartnerId: string, key: string, value: any) {
		const query = { where: { productPartnerId, key } };
		const t = new ProductPartnerConfig();
		t.key = key;
		t.value = value.toString();

		await DataSeederHelper.seedItem(ProductPartnerConfig, query, t);
	}
}
