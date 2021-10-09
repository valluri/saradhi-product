import { RepositoryBase, PagedRequest, PagedResponse } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { LoanRequest } from '@Entities/loan-request';

export class LoanRequestRepository extends RepositoryBase {
	static async get(ctx: Context, id: string): Promise<LoanRequest> {
		return await super.getResource(ctx, LoanRequest, { where: { id } });
	}

	static async getAll(ctx: Context<PagedRequest<any>>, filter: {}): Promise<PagedResponse<LoanRequest>> {
		return await super.getPagedResources(ctx, LoanRequest, { where: filter });
	}

	static async save(ctx: Context, request: LoanRequest): Promise<LoanRequest> {
		return await super.saveResource<LoanRequest>(ctx, LoanRequest, request);
	}
}
