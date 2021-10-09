import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_partner_config' })
@Index(['productPartnerId'])
export class ProductPartnerConfig extends BaseModel {
	@Column({ nullable: false })
	productPartnerId: string;

	@Column({ nullable: false })
	key: string;

	@Column({ nullable: false })
	value: string;

	constructor() {
		super();
		this.productPartnerId = Constants.NULL_UUID;
		this.key = '';
		this.value = '';
	}
}
