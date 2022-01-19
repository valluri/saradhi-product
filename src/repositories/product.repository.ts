import { BaseModel, Constants, ErrorHelper, RepositoryBase, Utility } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { EntityManager, Repository } from 'typeorm';

export class ProductRepository extends RepositoryBase {
	static async getConfig(ctx: Context, productId: string): Promise<ProductConfig[]> {
		return await super.getResources(ctx, ProductConfig, { where: { productId } });
	}

	static async getConfigForKey(ctx: Context, productId: string, key: string): Promise<ProductConfig> {
		return await super.getResource(ctx, ProductConfig, { where: { productId, key } });
	}

	static async saveConfig(ctx: Context, productConfig: ProductConfig[]): Promise<ProductConfig[]> {
		return (await ProductRepository.saveResources(ctx, ProductConfig, productConfig)) as ProductConfig[];
	}

	static async getDocumentConfig(ctx: Context, productId: string): Promise<ProductDocument[]> {
		return await super.getResources(ctx, ProductDocument, { where: { productId } });
	}
}
