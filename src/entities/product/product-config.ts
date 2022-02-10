import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_config' })
@Index(['productId'])
export class ProductConfig extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ nullable: false })
	key: string;

	@Column({ nullable: false })
	value: string;

	@Column({ nullable: true })
	description?: string;

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.key = '';
		this.value = '';
	}
}
