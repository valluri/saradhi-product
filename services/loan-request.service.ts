import { Context } from 'moleculer';
import { Action, Service } from 'moleculer-decorators';
import { ServiceBase, UserReportee } from '@valluri/saradhi-library';
import { LoanRequest } from '@Entities/loan-request';
import { LoanRequestRepository } from '@Repositories/loan-request-repository';
import { In } from 'typeorm';
import { RightsEnum, Constants, PagedRequest, PagedResponse, Utility } from '@valluri/saradhi-library';

@Service({
	name: 'loanRequest',
	version: 1,
})
export default class LoanRequestService extends ServiceBase {
	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.Loan_Request_Get,
		},
	})
	public async get(ctx: Context<{ id: string }>): Promise<LoanRequest> {
		return await LoanRequestRepository.get(ctx, ctx.params.id);
	}

	@Action({
		security: {
			requiredRight: RightsEnum.Loan_Request_Get,
		},
	})
	public async getAll(ctx: Context<PagedRequest>): Promise<PagedResponse<LoanRequest>> {
		const reportees: UserReportee[] = await ctx.call('v1.userList.getReporteeIds');
		const usersIds: string[] = reportees.map((e) => {
			return e.reporteeId!;
		});
		usersIds.push(Utility.getUserIdFromMeta(ctx));
		const filter = { createdBy: In(usersIds) };

		return await LoanRequestRepository.getAll(ctx, filter);
	}

	@Action({
		params: {
			firstName: { type: 'string', min: 3, max: 200 },
			lastName: { type: 'string', min: 3, max: 200 },
			gender: { type: 'string' },
			mobile: { type: 'string' },
			email: { type: 'email', optional: true },
			loanType: { type: 'string', min: 2, max: 200 },
			loanAmount: { type: 'string', min: 2, max: 200 },
			tenure: { type: 'string', optional: true },
			additionalInfo: { type: 'string', optional: true },
		},
		security: {
			requiredRight: RightsEnum.Loan_Request_Create,
		},
	})
	public async create(ctx: Context<LoanRequest>): Promise<LoanRequest> {
		ctx.params.id = undefined;
		return await LoanRequestRepository.save(ctx, ctx.params);
	}
}

module.exports = LoanRequestService;
