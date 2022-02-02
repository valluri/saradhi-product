import { NameCodeBaseModel } from '@valluri/saradhi-library';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'stages' })
export class Stage extends NameCodeBaseModel {
	@Column({ nullable: true })
	viewRight: string;

	@Column({ nullable: true })
	editRight: string;

	constructor() {
		super();

		this.viewRight = '';
		this.editRight = '';
	}
}
