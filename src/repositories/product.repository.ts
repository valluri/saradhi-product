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
		return (await ProductRepository.saveResources2(ctx, ProductConfig, productConfig)) as ProductConfig[];
	}

	static async getDocumentConfig(ctx: Context, productId: string): Promise<ProductDocument[]> {
		return await super.getResources(ctx, ProductDocument, { where: { productId } });
	}

	public static async saveResources2<T extends BaseModel>(
		ctx: Context,
		entityClass: ClassConstructor<T>,
		object: T | T[],
		entityManager?: EntityManager,
	): Promise<T | T[]> {
		// convert to object as we get json objects and not an instance of the entity.
		// happens when the object has been hydrated from a MQ object
		object = plainToClass(entityClass, object);

		const userId: string = Utility.getUserIdFromMeta(ctx).toString();

		if (Array.isArray(object)) {
			object.forEach((e) => {
				e = ProductRepository.setAuditFields<T>(e, userId);
			});
		} else {
			object = ProductRepository.setAuditFields(object, userId);
		}

		if (entityManager) {
			// have this object when the call is part of a transaction
			return await entityManager.save(object);
		} else {
			const conn = await this.getConnection();
			return await conn.manager.save(object);
		}
	}

	public static async doSoftDeleteUsingId2<T extends BaseModel>(
		ctx: Context,
		entityClass: ClassConstructor<T>,
		id: string,
		entityManager?: EntityManager,
	) {
		const dbItem: T = await this.getResourceById(ctx, entityClass, id);
		if (dbItem == null) {
			ErrorHelper.Throw404();
		}

		const userId: string = Utility.getUserIdFromMeta(ctx).toString();
		dbItem.modifiedBy = userId;
		dbItem.deleted = true;

		return await this.saveResources2(ctx, entityClass, dbItem, entityManager);
	}

	public static async doSoftDelete2<T extends BaseModel>(
		ctx: Context<any>,
		entityClass: ClassConstructor<T>,
		options: {},
		entityManager?: EntityManager,
	) {
		options = this.addDefaultOptions(ctx, options);

		const repo: Repository<T> = await this.getRepository<T>(entityClass);
		const dbItem = await repo.findOne(options);
		if (dbItem != null) {
			dbItem.deleted = true;
			await this.saveResources2(ctx, entityClass, dbItem, entityManager);
		}
	}

	private static setAuditFields<T extends BaseModel>(object: T, userId: string): T {
		if (!object.createdBy && (!object.id || object.id == Constants.NULL_UUID)) {
			object.createdBy = userId;
		}
		object.modifiedBy = userId;
		return object;
	}
}
