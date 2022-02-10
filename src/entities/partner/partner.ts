import { EntityStatusType } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';
import { NameCodeBaseModel } from '@valluri/saradhi-library';

@Entity({ name: 'partners' })
export class Partner extends NameCodeBaseModel {
	@Column({ nullable: false })
	status: EntityStatusType;

	constructor() {
		super();
		this.status = EntityStatusType.Active;
	}
}
