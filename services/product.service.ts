import { BaseModel, Constants, ErrorHelper, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Method, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ProductPinCode } from '@Entities/product/product-pincode';
import { ProductRepository } from '@Repositories/product.repository';
import { ClassConstructor } from 'class-transformer';
import { EntityManager } from 'typeorm';

@Service({
	name: 'product',
	version: 1,
})
export default class ProductService extends ServiceBase {
	private static productConfigParams = {
		productId: Constants.ParamValidation.id,
		key: { type: 'string' },
		value: { type: 'string' },
		description: { type: 'string', optional: true },
	};
	private static productDocumentParams = {
		productId: Constants.ParamValidation.id,
		documentCode: { type: 'string' },
		mandatory: Constants.ParamValidation.boolean,
		description: { type: 'string', optional: true },
	};

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
		params: ProductService.productConfigParams,
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async insertConfig(ctx: Context<ProductConfig>): Promise<ProductConfig> {
		return ProductRepository.insertResource(ctx, ProductConfig, { productId: ctx.params.productId, key: ctx.params.key });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...ProductService.productConfigParams,
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async updateConfig(ctx: Context<ProductConfig>): Promise<ProductConfig> {
		return ProductRepository.updateResource(ctx, ProductConfig, { productId: ctx.params.productId, key: ctx.params.key });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async deleteConfig(ctx: Context<{ id: string }>): Promise<ProductConfig> {
		return await ProductRepository.doSoftDeleteUsingId(ctx, ProductConfig, ctx.params.id);
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
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async insertDocumentConfig(ctx: Context<ProductDocument>): Promise<ProductDocument> {
		return ProductRepository.insertResource(ctx, ProductDocument, { productId: ctx.params.productId, documentCode: ctx.params.documentCode });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...ProductService.productDocumentParams,
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async updateDocumentConfig(ctx: Context<ProductDocument>): Promise<ProductDocument> {
		return ProductRepository.updateResource(ctx, ProductDocument, { productId: ctx.params.productId, documentCode: ctx.params.documentCode });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.ProductConfig_Manage,
		},
	})
	public async deleteDocumentConfig(ctx: Context<{ id: string }>): Promise<ProductDocument> {
		return await ProductRepository.doSoftDeleteUsingId(ctx, ProductDocument, ctx.params.id);
	}
}

module.exports = ProductService;
