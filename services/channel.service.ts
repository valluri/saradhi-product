import { CtxMeta, ServiceBase, Utility } from '@valluri/saradhi-library';
import { Action, Service } from 'moleculer-decorators';
import { Context, ServiceBroker } from 'moleculer';

@Service({
	name: 'channel',
	version: 1,
	channels: {
		'channel.test': {
			maxInFlight: 3,
			maxRetries: 3,
			async handler(payload: { jwt: string; id: number }) {
				const ctx: Context = Utility.getContext((this as any).broker, payload.jwt);

				await ctx.call('v1.channel.worker', { id: payload.id });
			},
		},
	},
})
export default class ChannelService extends ServiceBase {
	@Action({
		params: {
			id: { type: 'number' },
		},
	})
	public async send(ctx: Context<{ id: number }>) {
		this.broker.sendToChannel('channel.test', { jwt: (ctx.meta as any).jwt, id: ctx.params.id });
	}

	@Action({
		params: {
			id: { type: 'number' },
		},
	})
	public async worker(ctx: Context<{ id: number }>) {
		console.log(ctx.params.id);
		Utility.sleep(5);
	}
}

module.exports = ChannelService;
