import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_stages' })
@Index(['productId'])
export class ProductStage extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ nullable: false })
	stageCode: string;

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.stageCode = '';
	}
}
