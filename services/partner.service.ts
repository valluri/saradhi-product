import { Constants, EnrichmentHelper, KeyValuePair2, Messages, PagedResponse, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Method, Service } from 'moleculer-decorators';
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

	@Action({
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async getPartners(ctx: Context): Promise<PagedResponse<Partner>> {
		const returnValue = await PartnerRepository.getPagedResources(ctx, Partner, { where: {} });
		return await this.enrich(ctx, returnValue);
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
		const returnValue = await PartnerRepository.getResourceById(ctx, Partner, ctx.params.id);
		return await this.enrich(ctx, returnValue);
	}

	@Action({
		params: PartnerService.partnerParams,
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async insertPartner(ctx: Context<Partner>): Promise<Partner> {
		const returnValue = await PartnerRepository.insertResource(ctx, Partner, { code: ctx.params.code }, undefined, Messages.DUPLICATE_ENTITY_CODE);
		return await this.enrich(ctx, returnValue);
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
		const returnValue = await PartnerRepository.updateResource(ctx, Partner, { id: ctx.params.id });
		return await this.enrich(ctx, returnValue);
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
		const returnValue = await PartnerRepository.doSoftDeleteUsingId(ctx, Partner, ctx.params.id);
		return await this.enrich(ctx, returnValue);
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
		const returnValue = await PartnerRepository.getPagedResources(ctx, PartnerContact, { where: { partnerId: ctx.params.partnerId } });
		return await this.enrich(ctx, returnValue);
	}

	@Action({
		params: PartnerService.contactParams,
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async insertContact(ctx: Context<PartnerContact>): Promise<PartnerContact> {
		const returnValue = await PartnerRepository.insertResource(ctx, PartnerContact, { partnerId: ctx.params.partnerId, email: ctx.params.email });
		return await this.enrich(ctx, returnValue);
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
		const returnValue = await PartnerRepository.updateResource(ctx, PartnerContact, { id: ctx.params.id }, undefined, ignoreKeys);
		return await this.enrich(ctx, returnValue);
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
		const returnValue = await PartnerRepository.doSoftDeleteUsingId(ctx, PartnerContact, ctx.params.id);
		return await this.enrich(ctx, returnValue);
	}

	@Action({
		params: {
			ids: Constants.ParamValidation.ids,
		},
	})
	// TODO: Cache this
	public async getForEnrichment(ctx: Context<{ ids: string[] }>): Promise<KeyValuePair2<string, string>[]> {
		const returnValue = await PartnerRepository.getForEnrichment(ctx, ctx.params.ids);

		return returnValue.map((e) => {
			const displayName: string = `${e.name} (${e.code})`.trim();
			return new KeyValuePair2<string, string>(e.id!, displayName);
		});
	}

	private async enrich(ctx: Context, data: Partner): Promise<Partner>;

	private async enrich(ctx: Context, data: PagedResponse<Partner>): Promise<PagedResponse<Partner>>;

	private async enrich(ctx: Context, data: PartnerContact): Promise<PartnerContact>;

	private async enrich(ctx: Context, data: PagedResponse<PartnerContact>): Promise<PagedResponse<PartnerContact>>;

	@Method
	private async enrich(
		ctx: Context,
		data: Partner | PagedResponse<Partner> | PartnerContact | PagedResponse<PartnerContact>,
	): Promise<Partner | PagedResponse<Partner> | PartnerContact | PagedResponse<PartnerContact>> {
		return await EnrichmentHelper.enrich(ctx, data, [], 'v1.userList.getLiteUsingIds');
	}
}

module.exports = PartnerService;
