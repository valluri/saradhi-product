import { AddressType, CbStatusType, CbType, TelephoneType, CbIdType } from '@ServiceHelpers/enums';
import { BaseModel } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'cb_requests' })
export class CbRequest extends BaseModel {
	constructor() {
		super();
		this.addressType = AddressType.Permanent;
		this.telephoneType = TelephoneType.Permanent;
		this.identifierType = CbIdType.Uid;
		this.status = CbStatusType.Requested;
	}

	@Column({ nullable: true })
	address?: string;

	@Column({
		type: 'enum',
		enum: AddressType,
		nullable: true,
	})
	addressType: AddressType;

	@Column({ nullable: true })
	applicantName?: string;

	@Column({ nullable: true })
	City?: string;

	@Column({ nullable: true })
	dateOfBirth?: Date;

	@Column({ nullable: true })
	error?: string;

	@Column({ nullable: true })
	identifier?: string;

	@Column({ type: 'enum', enum: CbIdType, nullable: true })
	identifierType: CbIdType;

	@Column({ nullable: true })
	pinCode?: string;

	@Column({ nullable: true })
	reportId?: string;

	@Column({ nullable: true })
	responseReceivedAt?: Date;

	responseXml?: string;

	@Column({ nullable: true })
	responseUrl?: string;

	@Column({ nullable: true })
	score?: number;

	@Column({ nullable: true })
	scoreAvailable?: boolean;

	@Column({ nullable: true })
	source?: string;

	@Column({ nullable: true })
	state?: string;

	@Column({ type: 'enum', enum: CbStatusType, nullable: true })
	status: CbStatusType;

	@Column({ nullable: true })
	telephone?: string;

	@Column({ type: 'enum', enum: TelephoneType, nullable: true })
	telephoneType: TelephoneType;

	@Column({ nullable: true })
	uniqueRef?: string;

	@Column({ type: 'enum', enum: CbType, nullable: true })
	cbType?: CbType;
}
