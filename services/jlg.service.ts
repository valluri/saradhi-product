import { Constants, Messages, RightsEnum, ServiceBase } from '@valluri/saradhi-library';
import { Action, Service } from 'moleculer-decorators';
import { Context } from 'moleculer';
import { Jlg } from '@Entities/loan-journey/jlg';
import { JlgRepository } from '@Repositories/jlg-repository';

@Service({
	name: 'jlg',
	version: 1,
})
export default class JlgService extends ServiceBase {
	private static jlgParams = {
		name: { type: 'string' },
		code: { type: 'string' },
		status: { type: 'string' },
	};

	@Action()
	public async get(ctx: Context<{ id: string }>): Promise<Jlg> {
		return await JlgRepository.getResourceById(ctx, Jlg, ctx.params.id);
	}

	@Action({
		params: JlgService.jlgParams,
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async create(ctx: Context<Jlg>): Promise<Jlg> {
		return JlgRepository.insertResource(ctx, Jlg, { code: ctx.params.code }, undefined, Messages.DUPLICATE_ENTITY_CODE);
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
			...JlgService.jlgParams,
		},
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async update(ctx: Context<Jlg>): Promise<Jlg> {
		// TODO: Prevent duplicate codes
		// TODO: Should not update the Code
		return JlgRepository.updateResource(ctx, Jlg, { id: ctx.params.id });
	}

	@Action({
		params: {
			id: Constants.ParamValidation.id,
		},
		security: {
			requiredRight: RightsEnum.Partner_Manage,
		},
	})
	public async delete(ctx: Context<{ id: string }>): Promise<Jlg> {
		return await JlgRepository.doSoftDeleteUsingId(ctx, Jlg, ctx.params.id);
	}
}

module.exports = JlgService;
