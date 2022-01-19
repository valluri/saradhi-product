import { Constants, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ProductPinCode } from '@Entities/product/product-pincode';
import { ProductRepository } from '@Repositories/product.repository';

@Service({
	name: 'product',
	version: 1,
})
export default class ProductService extends ServiceBase {
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
		params: {
			config: {
				type: 'array',
				items: {
					type: 'object',
					props: {
						productId: Constants.ParamValidation.id,
						key: { type: 'string' },
						value: { type: 'string' },
						description: { type: 'string', optional: true },
					},
				},
			},
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async saveConfig(ctx: Context<{ config: ProductConfig[] }>): Promise<ProductConfig[]> {
		return await ProductRepository.saveConfig(ctx, ctx.params.config);
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
		params: {
			productId: Constants.ParamValidation.id,
			documentCode: { type: 'string' },
			mandatory: Constants.ParamValidation.boolean,
			description: { type: 'string', optional: true },
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async saveDocumentConfig(ctx: Context<ProductDocument>): Promise<ProductDocument> {
		let dbItem: ProductDocument = await ProductRepository.getResource(ctx, ProductDocument, {
			where: { productId: ctx.params.productId, documentCode: ctx.params.documentCode },
		});

		if (dbItem) {
			dbItem.mandatory = ctx.params.mandatory;
			dbItem.description = ctx.params.description;
		} else {
			dbItem = ctx.params;
			dbItem.id = undefined;
		}

		return await ProductRepository.saveResource(ctx, ProductDocument, ctx.params);
	}

	@Action({
		params: {
			productDocumentId: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async deleteDocumentConfig(ctx: Context<{ productDocumentId: string }>): Promise<ProductDocument> {
		return await ProductRepository.doSoftDeleteUsingId(ctx, ProductDocument, ctx.params.productDocumentId);
	}
}

module.exports = ProductService;
