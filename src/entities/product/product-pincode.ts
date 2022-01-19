import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_pincodes' })
@Index(['productId', 'pinCode'])
export class ProductPinCode extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ nullable: false })
	pinCode: string;

	@Column({ nullable: false, default: true })
	isPositive: boolean;

	@Column({ nullable: false })
	description?: string;

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.pinCode = '';
		this.isPositive = true;
	}
}
