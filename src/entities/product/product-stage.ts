import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_stages' })
@Index(['productId'])
export class ProductStage extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ nullable: false })
	stageCode: string;

	@Column({ nullable: false, default: 10 })
	order: number;

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.stageCode = '';
		this.order = 10;
	}
}
