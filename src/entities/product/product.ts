import { ProductCategory, NameCodeBaseModel, JourneyType } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'products' })
export class Product extends NameCodeBaseModel {
	@Column({ type: 'enum', enum: ProductCategory })
	category: ProductCategory;

	@Column({ nullable: false })
	partnerCode: string;

	partnerName?: string;

	@Column({ nullable: false, default: 10 })
	priority: number;

	@Column({ type: 'enum', enum: JourneyType })
	journeyType: JourneyType;

	@Column({ nullable: false })
	preQualAction: string;

	@Column({ nullable: false })
	eligibilityAction: string;

	constructor() {
		super();

		this.partnerCode = '';
		this.priority = 10;
		this.journeyType = JourneyType.LeadOnly;
		this.category = ProductCategory.MsmeLoan;
		this.preQualAction = '';
		this.eligibilityAction = '';
	}
}
