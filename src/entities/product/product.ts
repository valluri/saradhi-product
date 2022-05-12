import { Constants, NameCodeBaseModel } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'products' })
export class Product extends NameCodeBaseModel {
	@Column({ nullable: false, default: Constants.NULL_UUID })
	partnerId: string;

	partnerName?: string;

	@Column({ nullable: false, default: 10 })
	priority: number;

	constructor() {
		super();

		this.partnerId = '';
		this.priority = 10;
	}
}
