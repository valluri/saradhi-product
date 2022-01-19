import { ProductCategory, NameCodeBaseModel, JourneyType } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'products' })
export class Product extends NameCodeBaseModel {
	@Column({
		type: 'enum',
		enum: ProductCategory,
	})
	category: ProductCategory;

	@Column({ nullable: false })
	productCode: string;

	@Column({ nullable: false })
	partnerCode: string;

	@Column({ nullable: false, default: 10 })
	priority: number;

	@Column({
		type: 'enum',
		enum: JourneyType,
	})
	type: JourneyType;

	constructor() {
		super();
		this.productCode = '';
		this.partnerCode = '';
		this.priority = 10;
		this.type = JourneyType.LeadOnly;
		this.category = ProductCategory.MsmeLoan;
	}
}
