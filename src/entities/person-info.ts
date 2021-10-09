import { Entity, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { Address, BaseModel } from '@valluri/saradhi-library';

@Entity({ name: 'persons_info' })
@Index(['mobile', 'email'])
export class PersonInfo extends BaseModel {
	@Column({ nullable: true, comment: 'PII' })
	firstName: string;

	@Column({ nullable: true, comment: 'PII' })
	lastName: string;

	@Column({ nullable: true, comment: 'PII' })
	gender: string;

	@Column({ nullable: true, comment: 'PII' })
	mobile?: string;

	@Column({ nullable: true, comment: 'PII' })
	email?: string;

	@Column({ nullable: true, comment: 'PII' })
	pan?: string;

	@Column({ nullable: true, comment: 'PII' })
	dob?: Date;

	@Column({ nullable: true, comment: 'PII' })
	fathersName?: string;

	@Column({ nullable: true, comment: 'PII' })
	spouseName?: string;

	@OneToOne(() => Address, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	presentAddress?: Address;

	@OneToOne(() => Address, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	permanentAddress?: Address;

	@Column({ nullable: true })
	additionalInfo?: string;

	constructor() {
		super();
		this.firstName = '';
		this.lastName = '';
		this.gender = 'M';
	}
}
