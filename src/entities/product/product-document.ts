import { Constants, BaseModel } from '@valluri/saradhi-library';
import { Entity, Column, Index } from 'typeorm';

@Entity({ name: 'product_documents' })
@Index(['productId'])
export class ProductDocument extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	productId: string;

	@Column({ nullable: false })
	documentCode: string;

	documentName?: string;

	@Column({ nullable: false, default: false })
	mandatory: boolean;

	@Column({ nullable: false })
	description?: string;

	constructor() {
		super();
		this.productId = Constants.NULL_UUID;
		this.documentCode = '';
		this.mandatory = false;
	}
}
