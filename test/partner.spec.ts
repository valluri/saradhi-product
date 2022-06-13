'use strict';

import { Partner } from '@Entities/partner/partner';
import { PartnerContact } from '@Entities/partner/partner-contact';
import { EntityStatusType, PagedResponse, Utility } from '@valluri/saradhi-library';
import { plainToClass } from 'class-transformer';
import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([]);
let opts = {};

beforeAll(async () => {
	opts = await TestHelper.startBroker(broker);
});

afterAll(async () => await TestHelper.stopBroker(broker));

test('partner e2e', async () => {
	let name: string = Utility.getRandomString(10);
	const code: string = Utility.getRandomString(5);
	const p: Partner = new Partner();
	p.name = name;
	p.code = code;
	p.status = EntityStatusType.Active;

	let savedpartner: Partner = await broker.call('v1.partner.insertPartner', p, opts);
	await PartnerTestHelper.validatePartner(p);

	savedpartner.name = Utility.getRandomString(10);
	await broker.call('v1.partner.updatePartner', savedpartner, opts);
	await PartnerTestHelper.validatePartner(savedpartner);

	const partnerId: string = savedpartner.id!;
	savedpartner = await broker.call('v1.partner.getPartner', { id: savedpartner.id }, opts);
	expect(savedpartner.id).toBe(partnerId);

	await broker.call('v1.partner.deletePartner', { id: savedpartner.id }, opts);
	const allpartners: PagedResponse<Partner> = await broker.call('v1.partner.getPartners', {}, opts);
	let pf = allpartners.items.filter((e) => e.code === p.code);

	pf = plainToClass(Partner, pf);
	expect(pf).toBeArrayOfTypeOfLength(Partner, 0);
});

test('partner contact e2e', async () => {
	const allpartners: PagedResponse<Partner> = await broker.call('v1.partner.getPartners', {}, opts);

	const partnerId: string = allpartners.items[0].id!;

	const p: PartnerContact = new PartnerContact();
	p.partnerId = partnerId;
	p.name = Utility.getRandomString(10);
	p.designation = Utility.getRandomString(5);
	p.email = Utility.getRandomString(10) + '@gmail.com';
	p.mobile = Utility.getRandomNumber(10);

	p.status = EntityStatusType.Active;

	const savedContact: PartnerContact = await broker.call('v1.partner.insertContact', p, opts);
	await PartnerTestHelper.validateContact(p);

	savedContact.name = Utility.getRandomString(10);
	savedContact.designation = Utility.getRandomString(5);
	savedContact.email = Utility.getRandomString(10) + '@gmail.com';
	savedContact.mobile = Utility.getRandomNumber(10);
	await broker.call('v1.partner.updateContact', savedContact, opts);
	await PartnerTestHelper.validateContact(savedContact);

	await broker.call('v1.partner.deleteContact', { id: savedContact.id }, opts);
	let allContacts: PagedResponse<PartnerContact> = await broker.call('v1.partner.getContacts', { partnerId }, opts);

	allContacts.items = plainToClass(PartnerContact, allContacts.items);

	let pf = allContacts.items.filter((e) => e.id === p.id);

	expect(pf).toBeArrayOfTypeOfLength(Partner, 0);
});

class PartnerTestHelper {
	static async validatePartner(p: Partner) {
		const allpartners: PagedResponse<Partner> = await broker.call('v1.partner.getPartners', {}, opts);
		let pf = allpartners.items.filter((e) => e.code === p.code);

		pf = plainToClass(Partner, pf);
		expect(pf).toBeArrayOfTypeOfLength(Partner, 1);

		expect(pf[0].id).toBeUuid();
		expect(pf[0].name).toBe(p.name);
		expect(pf[0].status).toBe(p.status);
	}

	static async validateContact(pc: PartnerContact) {
		const allContacts: PagedResponse<PartnerContact> = await broker.call('v1.partner.getContacts', { partnerId: pc.partnerId }, opts);
		let c = allContacts.items.filter((e) => e.email === pc.email);

		c = plainToClass(PartnerContact, c);
		expect(c).toBeArrayOfTypeOfLength(PartnerContact, 1);

		expect(c[0].id).toBeUuid();
		expect(c[0].name).toBe(pc.name);
		expect(c[0].designation).toBe(pc.designation);
		expect(c[0].email).toBe(pc.email);
		expect(c[0].mobile).toBe(pc.mobile);
		expect(c[0].status).toBe(pc.status);
	}
}
