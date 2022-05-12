import { Context } from 'moleculer';
import { RepositoryBase } from '@valluri/saradhi-library';

export class ConfigDataSeeder extends RepositoryBase {
	public static async seed(ctx: Context) {
		ctx.broker.logger.info('config seed started');

		ctx.broker.logger.info('config seed done');
	}
}
