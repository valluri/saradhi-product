'use strict';

import { LoanRequest } from '@Entities/loan-request';
import LoanRequestService from '@MicroServices/loan-request.service';
import { PagedResponse, Utility } from '@valluri/saradhi-library';
import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([LoanRequestService]);
let opts = {};

beforeAll(async () => {
	opts = await TestHelper.startBroker(broker);
});

afterAll(async () => await broker.stop());

test('loan request create', async () => {
	const p: LoanRequest = new LoanRequest();

	p.firstName = Utility.getRandomString(10);
	p.lastName = Utility.getRandomString(10);
	p.gender = 'Male';
	p.mobile = Utility.getRandomNumber(10);
	p.email = 'bvalluri@gmail.com';
	p.loanType = '4W';
	p.loanAmount = Utility.getRandomNumber(5);
	p.tenure = '5 years';
	p.additionalInfo = {};

	const savedLoanRequest: LoanRequest = await broker.call('v1.loanRequest.create', p, opts);

	expect(savedLoanRequest.id).toBeUuid();
	LoanRequestHelper.compare(savedLoanRequest, p);

	const loanRequestFromGet: LoanRequest = await broker.call('v1.loanRequest.get', { id: savedLoanRequest.id }, opts);
	LoanRequestHelper.compare(loanRequestFromGet, p);

	const allLoanRequests: PagedResponse<LoanRequest> = await broker.call('v1.loanRequest.getAll', {}, opts);
	LoanRequestHelper.compare(allLoanRequests.items.filter((e) => e.id === savedLoanRequest.id)[0], p);
});

class LoanRequestHelper {
	public static compare(a: LoanRequest, b: LoanRequest) {
		expect(a.firstName).toBe(b.firstName);
		expect(a.lastName).toBe(b.lastName);
		expect(a.mobile).toBe(b.mobile);
		expect(a.email).toBe(b.email);
		expect(a.loanAmount).toBe(b.loanAmount);
	}
}
