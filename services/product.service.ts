import { Constants, Messages, PagedResponse, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Method, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ProductPreference } from '@Entities/product/product-preference';
import { ProductRepository } from '@Repositories/product-repository';
import { Product } from '@Entities/product/product';
import { Partner } from '@Entities/partner/partner';
import { ProductPreferenceType } from '@ServiceHelpers/enums';
import { ProductConfigKeys } from '@ServiceHelpers/product-config-keys';

@Service({
	name: 'product',
	version: 1,
})
export default class ProductService extends ServiceBase {
	private static productParams = {
		name: { type: 'string' },
		code: { type: 'string' },
		description: { type: 'string', optional: true },
		partnerId: { type: 'string' },
	};
	private static productDocumentParams = {
		productId: Constants.ParamValidation.id,
		documentCode: { type: 'string' },
		mandatory: Constants.ParamValidation.boolean,
		description: { type: 'string', optional: true },
	};
	private static productPreferenceParams = {
		productId: Constants.ParamValidation.id,
		type: { type: 'string' },
		positive: Constants.ParamValidation.string_array,
		negative: Constants.ParamValidation.string_array,
	};
	private static productManageSecurity = {
		security: {
			requiredRight: RightsEnum.Product_Manage,
		},
	};
	private static listEntryParams = {
		productId: Constants.ParamValidation.id,
		listType: { type: 'string' },
		code: { type: 'string', min: 2, max: 100 },
	};

	@Action()
	public async getProducts(ctx: Context): Promise<PagedResponse<Product>> {
		const products: PagedResponse<Product> = await ProductRepository.getPagedResources(ctx, Product, { where: {} });

		if (products.total_count === 0) {
			return products;
		}

		const allPartners: PagedResponse<Partner> = await ctx.call('v1.partner.getPartners');

		products.items.forEach((element) => {
			const partner = allPartners.items.find((e) => e.id!.toUpperCase() === element.id!.toUpperCase());
			if (partner) {
				element.partnerName = partner.name;
			}
		});

		return products;
	}

	@Action({
		params: ProductService.productParams,
		...ProductService.productManageSecurity,
	})
	public async insertProduct(ctx: Context<Product>): Promise<Product> {
		const p: Product = await ProductRepository.insertResource(ctx, Product, { code: ctx.params.code }, undefined, Messages.DUPLICATE_ENTITY_CODE);
		await this.insertDefaultConfigMethod(ctx, p.id!);

		return p;
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...ProductService.productParams,
		},
		...ProductService.productManageSecurity,
	})
	public async updateProduct(ctx: Context<Product>): Promise<Product> {
		const ignoreKeys: string[] = ['partnerId'];
		return await ProductRepository.updateResource(ctx, Product, { id: ctx.params.id }, undefined, ignoreKeys);
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		...ProductService.productManageSecurity,
	})
	public async getProduct(ctx: Context<{ id: string }>): Promise<Product> {
		return await ProductRepository.getResourceById(ctx, Product, ctx.params.id);
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		...ProductService.productManageSecurity,
	})
	public async deleteProduct(ctx: Context<{ id: string }>): Promise<Product> {
		return await ProductRepository.doSoftDeleteUsingId(ctx, Product, ctx.params.id);
	}

	@Action({
		params: {
			productId: Constants.ParamValidation.id,
		},
	})
	public async getConfig(ctx: Context<{ productId: string }>): Promise<ProductConfig[]> {
		return await ProductRepository.getConfig(ctx, ctx.params.productId);
	}

	@Action({
		params: {
			productId: Constants.ParamValidation.id,
			key: { type: 'string' },
		},
	})
	public async getConfigForKey(ctx: Context<{ productId: string; key: string }>): Promise<ProductConfig> {
		return await ProductRepository.getConfigForKey(ctx, ctx.params.productId, ctx.params.key);
	}

	@Action({
		productId: Constants.ParamValidation.id,
		...ProductService.productManageSecurity,
	})
	public async insertDefaultConfig(ctx: Context<ProductConfig>): Promise<ProductConfig[]> {
		return await this.insertDefaultConfigMethod(ctx, ctx.params.productId);
	}

	@Action({
		params: {
			productId: Constants.ParamValidation.id,
			config: {
				type: 'array',
				items: {
					type: 'object',
					props: {
						key: { type: 'string' },
						value: { type: 'string' },
						description: { type: 'string', optional: true },
					},
				},
			},
		},
		...ProductService.productManageSecurity,
	})
	public async updateConfig(ctx: Context<{ productId: string; config: ProductConfig[] }>): Promise<ProductConfig[]> {
		const dbConfigs: ProductConfig[] = await ProductRepository.getConfig(ctx, ctx.params.productId);

		dbConfigs.forEach((dbConfig) => {
			const configParam = ctx.params.config.find((e) => e.key === dbConfig.key);

			if (configParam) {
				dbConfig.value = configParam.value;
				dbConfig.description = configParam.description;
			}
		});

		return (await ProductRepository.saveResources(ctx, ProductConfig, dbConfigs)) as ProductConfig[];
	}

	@Action({
		params: {
			productId: Constants.ParamValidation.id,
		},
	})
	public async getDocumentConfig(ctx: Context<{ productId: string }>): Promise<ProductDocument[]> {
		// get the product document config
		const productDocuments: ProductDocument[] = await ProductRepository.getDocumentConfig(ctx, ctx.params.productId);

		if (productDocuments.length === 0) {
			// not documents configured for this product. return
			return productDocuments;
		}

		// get all document-types from masters to populate the name
		const allDocuments: { name: string; code: string }[] = await ctx.call('v1.documentType.get');

		productDocuments.forEach((element) => {
			// find matching doc-type from masters
			const doc = allDocuments.find((e) => e.code.toUpperCase() === element.documentCode.toUpperCase());
			if (doc) {
				// populate the name
				element.documentName = doc.name;
			}
		});

		return productDocuments;
	}

	@Action({
		params: ProductService.productDocumentParams,
		...ProductService.productManageSecurity,
	})
	public async insertDocumentConfig(ctx: Context<ProductDocument>): Promise<ProductDocument> {
		return await ProductRepository.insertResource(ctx, ProductDocument, { productId: ctx.params.productId, documentCode: ctx.params.documentCode });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...ProductService.productDocumentParams,
		},
		...ProductService.productManageSecurity,
	})
	public async updateDocumentConfig(ctx: Context<ProductDocument>): Promise<ProductDocument> {
		return await ProductRepository.updateResource(ctx, ProductDocument, { productId: ctx.params.productId, documentCode: ctx.params.documentCode });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		...ProductService.productManageSecurity,
	})
	public async deleteDocumentConfig(ctx: Context<{ id: string }>): Promise<ProductDocument> {
		return await ProductRepository.doSoftDeleteUsingId(ctx, ProductDocument, ctx.params.id);
	}

	@Action({
		params: {
			productId: Constants.ParamValidation.id,
			type: { type: 'string' },
		},
	})
	public async getProductPreference(ctx: Context<{ productId: string; type: ProductPreferenceType }>): Promise<ProductPreference> {
		return await ProductRepository.getResource(ctx, ProductPreference, { where: { productId: ctx.params.productId, type: ctx.params.type } });
	}

	@Action({
		params: ProductService.productPreferenceParams,
		...ProductService.productManageSecurity,
	})
	public async insertProductPreference(ctx: Context<ProductPreference>): Promise<ProductPreference> {
		return await ProductRepository.insertResource(ctx, ProductPreference, { productId: ctx.params.productId, type: ctx.params.type });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...ProductService.productPreferenceParams,
		},
		...ProductService.productManageSecurity,
	})
	public async updateProductPreference(ctx: Context<ProductPreference>): Promise<ProductPreference> {
		return await ProductRepository.updateResource(ctx, ProductPreference, { productId: ctx.params.productId, type: ctx.params.type });
	}

	@Action({
		visibility: 'public',
		params: {
			productId: Constants.ParamValidation.id,
			type: { type: 'string' },
			valueToCheck: { type: 'string', trim: true },
		},
	})
	public async isPreferenceAllowed(ctx: Context<{ productId: string; type: ProductPreferenceType; valueToCheck: string }>): Promise<boolean> {
		const p: ProductPreference = await ProductRepository.getResource(ctx, ProductPreference, {
			where: { productId: ctx.params.productId, type: ctx.params.type },
		});

		// no config for this type. so all values are allowed
		if (p == null) {
			return true;
		}

		// is the value in the negative list
		const inNegativeList = p.negative.filter((e) => e === ctx.params.valueToCheck).length > 0;

		// if positive list is blank all values are allowed.
		// if positives has some values, then ensure that the valueToCheck is present in there
		const inPositiveList = p.positive.length === 0 || p.positive.filter((e) => e === ctx.params.valueToCheck).length > 0;

		return inPositiveList && !inNegativeList;
	}

	//TODO: Add tests for this
	@Action({
		params: ProductService.listEntryParams,
		...ProductService.productManageSecurity,
	})
	public async insertListEntry(ctx: Context<ProductDocument>): Promise<ProductDocument> {
		return await ProductRepository.insertResource(ctx, ProductDocument, { productId: ctx.params.productId, documentCode: ctx.params.documentCode });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		...ProductService.productManageSecurity,
	})
	public async deleteListEntry(ctx: Context<{ id: string }>): Promise<ProductDocument> {
		return await ProductRepository.doSoftDeleteUsingId(ctx, ProductDocument, ctx.params.id);
	}

	@Method
	private async insertDefaultConfigMethod(ctx: Context, productId: string): Promise<ProductConfig[]> {
		const configs: ProductConfig[] = [];
		for (var x in ProductConfigKeys.ProductConfig) {
			const c: ProductConfig = new ProductConfig();
			c.productId = productId;

			// @ts-ignore
			c.key = ProductConfigKeys.ProductConfig[x];

			configs.push(c);
		}

		return (await ProductRepository.saveResources(ctx, ProductConfig, configs)) as ProductConfig[];
	}
}

module.exports = ProductService;
