import { JourneyType } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';
import { BaseModel } from '@valluri/saradhi-library';

@Entity({ name: 'product_partners' })
export class ProductPartner extends BaseModel {
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
	}
}
