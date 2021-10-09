import { ProductCategory } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';
import { NameCodeBaseModel } from '@valluri/saradhi-library';

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
