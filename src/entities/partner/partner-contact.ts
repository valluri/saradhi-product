import { BaseModel, Constants, EntityStatusType } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'partner_contacts' })
export class PartnerContact extends BaseModel {
	@Column({ nullable: false, type: 'uuid' })
	partnerId: string;

	@Column({ nullable: true, comment: 'PII' })
	name: string;

	@Column({ nullable: true, comment: 'PII' })
	designation?: string;

	@Column({ nullable: true, comment: 'PII' })
	mobile?: string;

	@Column({ nullable: true, comment: 'PII' })
	email?: string;

	@Column({ type: 'json', nullable: true })
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	additionalInfo?: any;

	@Column({ nullable: false })
	status: EntityStatusType;

	constructor() {
		super();
		this.partnerId = Constants.NULL_UUID;
		this.name = '';
		this.status = EntityStatusType.Active;
	}
}
