import { Entity, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { Address, BaseModel } from '@valluri/saradhi-library';

@Entity({ name: 'business_info' })
@Index(['businessName'])
export class BusinessInfo extends BaseModel {
	@Column({ nullable: true, comment: 'PII' })
	businessName: string;

	@Column({ nullable: true, comment: 'PII' })
	typeOfProducts: string;

	@OneToOne(() => Address, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	address?: Address;

	@Column({ nullable: true })
	additionalInfo?: string;

	constructor() {
		super();
		this.businessName = '';
		this.typeOfProducts = '';
	}
}
