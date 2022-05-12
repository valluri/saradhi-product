import { JlgStatusType } from '@ServiceHelpers/enums';
import { Address, NameCodeBaseModel } from '@valluri/saradhi-library';
import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';

@Entity({ name: 'jlgs' })
export class Jlg extends NameCodeBaseModel {
	@OneToOne(() => Address, {
		eager: true,
		cascade: false,
	})
	@JoinColumn()
	presentAddress?: Address;

	@Column({ type: 'enum', enum: JlgStatusType })
	status: JlgStatusType;

	constructor() {
		super();

		this.status = JlgStatusType.Created;
	}
}
