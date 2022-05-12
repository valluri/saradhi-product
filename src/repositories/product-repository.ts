import { BaseModel, ErrorHelper, RepositoryBase } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ClassConstructor } from 'class-transformer';
import { EntityManager } from 'typeorm';

export class ProductRepository extends RepositoryBase {
	static async getConfig(ctx: Context, productId: string): Promise<ProductConfig[]> {
		return await super.getResources(ctx, ProductConfig, { where: { productId } }, true);
	}

	static async getConfigForKey(ctx: Context, productId: string, key: string): Promise<ProductConfig> {
		return await super.getResource(ctx, ProductConfig, { where: { productId, key } });
	}

	static async getDocumentConfig(ctx: Context, productId: string): Promise<ProductDocument[]> {
		return await super.getResources(ctx, ProductDocument, { where: { productId } });
	}

	// public static async updateResource<T extends BaseModel>(
	// 	ctx: Context<T>,
	// 	entityClass: ClassConstructor<T>,
	// 	searchCondition: {},
	// 	entityManager?: EntityManager,
	// 	ignoreKeys?: string[],
	// ): Promise<T> {
	// 	let dbItem: T = await RepositoryBase.getResource(ctx, entityClass, { where: searchCondition });

	// 	if (!dbItem) {
	// 		ErrorHelper.Throw404();
	// 	}

	// 	const defaultIgnoreKeys: string[] = ['tenantId', 'createdDate', 'createdBy'];

	// 	if (ignoreKeys) {
	// 		ignoreKeys = [...ignoreKeys, ...defaultIgnoreKeys];
	// 	} else {
	// 		ignoreKeys = [...defaultIgnoreKeys];
	// 	}

	// 	for (var x in ctx.params) {
	// 		if (ignoreKeys.filter((e) => e == x).length == 0) {
	// 			// @ts-ignore
	// 			dbItem[x] = ctx.params[x];
	// 		}
	// 	}

	// 	return (await RepositoryBase.saveResources(ctx, entityClass, dbItem, entityManager)) as T;
	// }
}
