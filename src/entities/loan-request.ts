import { Entity, Column, Index, JoinColumn, OneToOne } from 'typeorm';
import { BaseModel } from '@valluri/saradhi-library';
import { PersonInfo } from './person-info';
import { BusinessInfo } from './business-info';

@Entity({ name: 'loan_requests' })
@Index(['mobile'])
export class LoanRequest extends BaseModel {
	@OneToOne(() => PersonInfo, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	applicant: PersonInfo;

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

	@Column({ nullable: true })
	additionalInfo?: string;

	constructor() {
		super();
		this.applicant = new PersonInfo();
	}
}
