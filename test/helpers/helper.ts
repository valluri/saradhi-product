import Moleculer, { ServiceBroker } from 'moleculer';
import randomstring from 'randomstring';
import StartupService from '@MicroServices/startup.service';

export default class TestHelper {
	static userId: string = '';
	static jwt: string = '';

	static getBroker(services: Moleculer.ServiceSchema[] = []): ServiceBroker {
		const broker = new ServiceBroker({
			namespace: 'saradhi',
			transporter: process.env.TRANSPORTER,
			cacher: 'Memory',
			metrics: true,
			tracking: {
				enabled: true,
				shutdownTimeout: 10000,
			},
		});

		broker.createService(StartupService);

		services.forEach((e) => {
			broker.createService(e);
		});

		return broker;
	}

	static async startBroker(broker: ServiceBroker): Promise<{}> {
		await broker.start();

		return await TestHelper.getOptions(broker);
	}

	static async stopBroker(broker: ServiceBroker) {
		await broker.stop();
	}

	static async getServerJwt(broker: ServiceBroker, userId: number): Promise<{}> {
		const jwt: string = await broker.call('v1.auth.createServerJwt', { userId });
		return { meta: { jwt } };
	}

	static async getOptions(broker: ServiceBroker): Promise<{}> {
		return { meta: { jwt: '' } };
	}

	static async sleep(ms: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms * 1000);
		});
	}

	static getRandomName(length: number): string {
		return randomstring.generate({
			length: length,
			charset: 'alphabetic',
		});
	}

	static getRandomNumber(length: number): string {
		return randomstring.generate(length);
	}

	static async testEnv(key: string, expectedValue: string) {
		const val: string | undefined = process.env[key];

		expect(val).toBe(expectedValue);
	}
}
