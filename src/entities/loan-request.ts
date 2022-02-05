import { Entity, Column, Index, JoinColumn, OneToOne } from 'typeorm';
import { Address, BaseModel } from '@valluri/saradhi-library';
import { PersonInfo } from './person-info';
import { BusinessInfo } from './business-info';

@Entity({ name: 'loan_requests' })
@Index(['mobile'])
export class LoanRequest extends BaseModel {
	@Column({ nullable: true, comment: 'PII' })
	firstName: string;

	@Column({ nullable: true, comment: 'PII' })
	lastName: string;

	@Column({ nullable: true, comment: 'PII' })
	gender: string;

	@Column({ nullable: true, comment: 'PII' })
	mobile: string;

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

	@Column({ type: 'json', nullable: true })
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	additionalInfo?: any;

	@OneToOne(() => PersonInfo, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	guarantor?: PersonInfo;

	@OneToOne(() => BusinessInfo, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	businessInfo?: BusinessInfo;

	@Column({ nullable: true })
	loanType?: string;

	@Column({ nullable: true })
	loanAmount?: string;

	@Column({ nullable: true })
	tenure?: string;

	@Column({ nullable: true })
	creditScore?: number;

	@Column({ nullable: true })
	newToCredit?: boolean;

	@Column({ nullable: true })
	cbCheckDoneAt?: Date;

	constructor() {
		super();
		this.firstName = '';
		this.lastName = '';
		this.gender = 'M';
		this.mobile = '';
	}
}
