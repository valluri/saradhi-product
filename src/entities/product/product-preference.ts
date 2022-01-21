import { ProductPreferenceType } from '@ServiceHelpers/enums';
import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_preferences' })
@Index(['productId'])
export class ProductPreference extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ type: 'enum', enum: ProductPreferenceType, nullable: true })
	type: ProductPreferenceType;

	@Column('text', { array: true })
	positive: string[];

	@Column('text', { array: true })
	negative: string[];

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.type = ProductPreferenceType.PinCode;
		this.positive = [];
		this.negative = [];
	}
}
