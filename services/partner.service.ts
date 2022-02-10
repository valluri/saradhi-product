import { Constants, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { PartnerRepository } from '@Repositories/partner-repository';
import { Partner } from '@Entities/partner/partner';
import { PartnerContact } from '@Entities/partner/partner-contact';

@Service({
	name: 'partner',
	version: 1,
})
export default class PartnerService extends ServiceBase {
	private static partnerParams = {
		code: { type: 'string' },
		status: { type: 'string' },
	};
	// TODO: Add partner contact test(s)
	private static contactParams = {
		partnerId: { type: 'string' },
		name: { type: 'string' },
		designation: { type: 'string' },
		email: { type: 'email', optional: true },
		mobile: { type: 'string', optional: true },
	};

	@Action()
	public async getPartners(ctx: Context): Promise<Partner[]> {
		return await PartnerRepository.getResources(ctx, Partner, { where: {} }, true);
	}

	@Action({
		params: PartnerService.partnerParams,
		security: {
			requiredRight: RightsEnum.Partner_Manage,
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
			requiredRight: RightsEnum.Partner_Manage,
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
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async deletePartner(ctx: Context<{ id: string }>): Promise<Partner> {
		return await PartnerRepository.doSoftDeleteUsingId(ctx, Partner, ctx.params.id);
	}

	@Action({
		params: {
			partnerId: Constants.ParamValidation.id,
		},
	})
	public async getContacts(ctx: Context<{ partnerId: string }>): Promise<PartnerContact[]> {
		return await PartnerRepository.getResources(ctx, PartnerContact, { where: { partnerId: ctx.params.partnerId } });
	}

	@Action({
		params: PartnerService.contactParams,
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async insertContact(ctx: Context<PartnerContact>): Promise<PartnerContact> {
		return PartnerRepository.insertResource(ctx, PartnerContact, { partnerId: ctx.params.partnerId, email: ctx.params.email });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...PartnerService.contactParams,
		},
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async updateContact(ctx: Context<PartnerContact>): Promise<PartnerContact> {
		return PartnerRepository.updateResource(ctx, PartnerContact, { id: ctx.params.id });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async deleteContact(ctx: Context<{ id: string }>): Promise<PartnerContact> {
		return await PartnerRepository.doSoftDeleteUsingId(ctx, PartnerContact, ctx.params.id);
	}
}

module.exports = PartnerService;
