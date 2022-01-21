import { Constants, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { PartnerRepository } from '@Repositories/partner-repository';
import { Partner } from '@Entities/partner/partner';

@Service({
	name: 'partner',
	version: 1,
})
export default class PartnerService extends ServiceBase {
	private static partnerParams = {
		code: { type: 'string' },
		status: { type: 'string' },
	};

	@Action()
	public async getPartners(ctx: Context): Promise<Partner[]> {
		return await PartnerRepository.getResources(ctx, Partner, { where: {} }, true);
	}

	@Action({
		params: PartnerService.partnerParams,
		security: {
			requiredRight: RightsEnum.Product_Manage,
		},
	})
	public async insertPartner(ctx: Context<Partner>): Promise<Partner> {
		return PartnerRepository.insertResource(ctx, Partner, { code: ctx.params.code });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...PartnerService.partnerParams,
		},
		security: {
			requiredRight: RightsEnum.Product_Manage,
		},
	})
	public async updatePartner(ctx: Context<Partner>): Promise<Partner> {
		return PartnerRepository.updateResource(ctx, Partner, { id: ctx.params.id });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.Product_Manage,
		},
	})
	public async deletePartner(ctx: Context<{ id: string }>): Promise<Partner> {
		return await PartnerRepository.doSoftDeleteUsingId(ctx, Partner, ctx.params.id);
	}
}

module.exports = PartnerService;
