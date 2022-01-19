import { BaseModel, Constants, EntityStatusType } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'partner_contacts' })
export class PartnerContact extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	partnerId: string;

	@Column({ nullable: true, comment: 'PII' })
	firstName: string;

	@Column({ nullable: true, comment: 'PII' })
	lastName: string;

	@Column({ nullable: true, comment: 'PII' })
	mobile?: string;

	@Column({ nullable: true, comment: 'PII' })
	email?: string;

	@Column({ nullable: true, comment: 'PII' })
	role?: string;

	@Column({ nullable: true })
	additionalInfo?: string;

	@Column({ nullable: false })
	status: EntityStatusType;

	constructor() {
		super();
		this.partnerId = Constants.NULL_UUID;
		this.firstName = '';
		this.lastName = '';
		this.status = EntityStatusType.Active;
	}
}
