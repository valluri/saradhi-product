import { RepositoryBase, PagedRequest, PagedResponse } from '@valluri/saradhi-library';
import { Context } from 'moleculer';
import { CbRequest } from '@Entities/credit-bureau';
import { CbIdType } from '@ServiceHelpers/enums';

export class CbRepository extends RepositoryBase {
	static async get(ctx: Context<PagedRequest<any>>, identifierType: CbIdType, id: string): Promise<PagedResponse<CbRequest>> {
		return await super.getPagedResources(ctx, CbRequest, { where: { IdentifierType: identifierType, identifier: id } });
	}

	static async getAll(ctx: Context<PagedRequest<any>>, filter: {}): Promise<PagedResponse<CbRequest>> {
		return await super.getPagedResources(ctx, CbRequest, { where: filter });
	}
}
