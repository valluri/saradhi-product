import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_screens' })
@Index(['productId'])
export class ProductScreen extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ nullable: false })
	screenCode: string;

	@Column({ nullable: false, default: 10 })
	order: number;

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.screenCode = '';
		this.order = 10;
	}
}
