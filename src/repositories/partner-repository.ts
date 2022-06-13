import { Partner } from '@Entities/partner/partner';
import { RepositoryBase } from '@valluri/saradhi-library';
import { Context } from 'moleculer';

export class PartnerRepository extends RepositoryBase {
	static async getForEnrichment(ctx: Context, ids: string[]): Promise<Partner[]> {
		const query: string = `select	"id", "name", "code"
													from 	product.partners
													where	id = any($1)
													and		deleted = false;`;

		return await RepositoryBase.runSql(ctx, query, ids);
	}
}
