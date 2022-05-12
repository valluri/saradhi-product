import Moleculer, { ServiceBroker } from 'moleculer';
import randomstring from 'randomstring';
import StartupService from '@MicroServices/startup.service';
import { LoginStatus, OtpSendToType } from '@valluri/saradhi-library';

export default class TestHelper {
	static userId: string = '';
	static jwt: string = '';
	static USER_MOBILE: string = '1234567890';

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

	static async getOptions(broker: ServiceBroker): Promise<{}> {
		await broker.call('v1.otp.sendOtp', { sendTo: TestHelper.USER_MOBILE, sendToType: OtpSendToType.PhoneNumber });
		let returnValue: any = await broker.call('v1.login.loginUsingPhoneNumber', {
			phoneNumber: TestHelper.USER_MOBILE,
			otp: '123456',
			platform: 'web',
			killExistingSession: true,
		});

		if (returnValue.loginStatus == LoginStatus.ActiveSessionExists) {
			returnValue = await broker.call('v1.login.loginUsingPhoneNumber', {
				phoneNumber: TestHelper.USER_MOBILE,
				otp: '123456',
				platform: 'web',
				killExistingSession: true,
				securityGuid: returnValue.securityGuid,
			});
		}
		TestHelper.userId = returnValue.userDetails.id!;

		return { meta: { jwt: returnValue.jwt } };
	}

	static async testEnv(key: string, expectedValue: string) {
		const val: string | undefined = process.env[key];

		expect(val).toBe(expectedValue);
	}
}
