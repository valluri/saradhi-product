import { Constants, Messages, PagedResponse, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
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
	// TODO:  Security??
	public async getPartners(ctx: Context): Promise<PagedResponse<Partner>> {
		return await PartnerRepository.getPagedResources(ctx, Partner, { where: {} });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async getPartner(ctx: Context<{ id: string }>): Promise<Partner> {
		return PartnerRepository.getResourceById(ctx, Partner, ctx.params.id);
	}

	@Action({
		params: PartnerService.partnerParams,
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async insertPartner(ctx: Context<Partner>): Promise<Partner> {
		return PartnerRepository.insertResource(ctx, Partner, { code: ctx.params.code }, undefined, Messages.DUPLICATE_ENTITY_CODE);
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
		// TODO: Prevent duplicate codes
		// TODO: Should not update the Code
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
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async getContacts(ctx: Context<{ partnerId: string }>): Promise<PagedResponse<PartnerContact>> {
		return await PartnerRepository.getPagedResources(ctx, PartnerContact, { where: { partnerId: ctx.params.partnerId } });
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
		const ignoreKeys: string[] = ['partnerId'];
		return PartnerRepository.updateResource(ctx, PartnerContact, { id: ctx.params.id }, undefined, ignoreKeys);
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
