'use strict';

import { LoanRequest } from '@Entities/loan-request';
import LoanRequestService from '@MicroServices/loan-request.service';
import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([LoanRequestService]);
let opts = {};

beforeAll(async () => {
	opts = await TestHelper.startBroker(broker);
});

afterAll(async () => await broker.stop());

test('loan request create', async () => {
	const p = {
		firstName: 'Test',
		lastName: 'Test',
		gender: 'Male',
		mobile: '12345',
		email: 'bvalluri@gmail.com',
		loanType: '4W',
		loanAmount: '200000',
		tenure: '5 years',
		additionalInfo: {},
	};

	const returnValue: LoanRequest = await broker.call('v1.loanRequest.create', p, opts);

	expect(returnValue.id).toBeUuid();
});
