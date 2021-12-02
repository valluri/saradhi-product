import { ProductCategory, NameCodeBaseModel } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'products' })
export class Product extends NameCodeBaseModel {
	@Column({
		type: 'enum',
		enum: ProductCategory,
	})
	category: ProductCategory;

	constructor() {
		super();

		this.category = ProductCategory.MsmeLoan;
	}
}
