'use strict';

import { Partner } from '@Entities/partner/partner';
import PartnerService from '@MicroServices/partner.service';
import { EntityStatusType, Utility } from '@valluri/saradhi-library';
import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([PartnerService]);
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

	const savedpartner: Partner = await broker.call('v1.partner.insertPartner', p, opts);
	await PartnerTestHelper.validatePartner(p);

	savedpartner.name = Utility.getRandomString(10);
	await broker.call('v1.partner.updatePartner', savedpartner, opts);
	await PartnerTestHelper.validatePartner(savedpartner);

	await broker.call('v1.partner.deletePartner', { id: savedpartner.id }, opts);
	const allpartners: Partner[] = await broker.call('v1.partner.getPartners', {}, opts);
	const pf = allpartners.filter((e) => e.code === p.code);

	expect(pf).toBeArrayOfTypeOfLength(Partner, 0);
});

test('partner contact e2e', async () => {
	let name: string = Utility.getRandomString(10);
	const code: string = Utility.getRandomString(5);
	const p: Partner = new Partner();
	p.name = name;
	p.code = code;
	p.status = EntityStatusType.Active;

	const savedpartner: Partner = await broker.call('v1.partner.insertContact', p, opts);
	await PartnerTestHelper.validatePartner(p);

	savedpartner.name = Utility.getRandomString(10);
	await broker.call('v1.partner.updateContact', savedpartner, opts);
	await PartnerTestHelper.validatePartner(savedpartner);

	await broker.call('v1.partner.deleteContact', { id: savedpartner.id }, opts);
	const allpartners: Partner[] = await broker.call('v1.partner.getPartners', {}, opts);
	const pf = allpartners.filter((e) => e.code === p.code);

	expect(pf).toBeArrayOfTypeOfLength(Partner, 0);
});

class PartnerTestHelper {
	static async validatePartner(p: Partner) {
		const allpartners: Partner[] = await broker.call('v1.partner.getPartners', {}, opts);
		const pf = allpartners.filter((e) => e.code === p.code);

		expect(pf).toBeArrayOfTypeOfLength(Partner, 1);

		expect(pf[0].id).toBeUuid();
		expect(pf[0].name).toBe(p.name);
		expect(pf[0].status).toBe(p.status);
	}

	static async validateContact(p: Partner) {
		const allpartners: Partner[] = await broker.call('v1.partner.getPartners', {}, opts);
		const pf = allpartners.filter((e) => e.code === p.code);

		expect(pf).toBeArrayOfTypeOfLength(Partner, 1);

		expect(pf[0].id).toBeUuid();
		expect(pf[0].name).toBe(p.name);
		expect(pf[0].status).toBe(p.status);
	}
}
