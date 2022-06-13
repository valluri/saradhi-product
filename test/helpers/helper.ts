import Moleculer, { Context, ServiceBroker } from 'moleculer';
import { LoginStatus, OtpSendToType, Utility } from '@valluri/saradhi-library';

export default class TestHelper {
	static userId: string = '';
	static jwt: string = '';
	static USER_PHONE_NUMBER: string = '5234567890';
	static defaultTenantCode: string = Utility.getEnv('DEFAULT_TENANT_CODE', 'subk');
	static preLoginOpts = { meta: { tenantCode: TestHelper.defaultTenantCode } };

	static getBroker(services: Moleculer.ServiceSchema[] = []): ServiceBroker {
		const broker = new ServiceBroker({
			namespace: 'sarthi',
			transporter: process.env.TRANSPORTER,
			cacher: 'Memory',
			metrics: true,
			tracking: {
				enabled: true,
				shutdownTimeout: 10000,
			},
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
		let returnValue: any = await TestHelper.loginUsingPhoneNumber(broker, TestHelper.USER_PHONE_NUMBER);

		TestHelper.userId = returnValue.userDetails!.id!;

		return { meta: { jwt: returnValue.jwt } };
	}

	static async loginUsingEmail(broker: ServiceBroker, userName: string, password: string): Promise<any> {
		let returnValue: any = await TestHelper.createContext(broker).call(
			'v1.login.loginUsingEmail',
			{
				userName: userName,
				password: password,
				platform: 'web',
				killExistingSession: true,
			},
			TestHelper.preLoginOpts,
		);

		if (returnValue.loginStatus == LoginStatus.ActiveSessionExists) {
			returnValue = await TestHelper.createContext(broker).call(
				'v1.login.loginUsingEmail',
				{
					userName: userName,
					password: password,
					platform: 'web',
					killExistingSession: true,
					securityGuid: returnValue.securityGuid,
				},
				TestHelper.preLoginOpts,
			);
		}

		expect(returnValue.loginStatus).toBe(LoginStatus.LoggedIn);

		return returnValue;
	}

	static async loginUsingPhoneNumber(broker: ServiceBroker, phoneNumber: string): Promise<any> {
		await broker.call('v1.otp.sendOtp', { sendTo: phoneNumber, sendToType: OtpSendToType.PhoneNumber }, TestHelper.preLoginOpts);
		let returnValue: any = await TestHelper.createContext(broker).call(
			'v1.login.loginUsingPhoneNumber',
			{
				phoneNumber: phoneNumber,
				otp: '123456',
				platform: 'web',
				killExistingSession: true,
			},
			TestHelper.preLoginOpts,
		);

		if (returnValue.loginStatus == LoginStatus.ActiveSessionExists) {
			returnValue = await TestHelper.createContext(broker).call(
				'v1.login.loginUsingPhoneNumber',
				{
					phoneNumber: phoneNumber,
					otp: '123456',
					platform: 'web',
					killExistingSession: true,
					securityGuid: returnValue.securityGuid,
				},
				TestHelper.preLoginOpts,
			);
		}
		return returnValue;
	}

	static async validateLoginResponse(returnValue: any) {
		expect(returnValue.sessionId).toBeUuid();
		expect(returnValue.loginStatus).toBe(LoginStatus.LoggedIn);
	}

	static async testEnv(key: string, expectedValue: string) {
		const val: string | undefined = process.env[key];

		expect(val).toBe(expectedValue);
	}

	static createContext(broker: ServiceBroker) {
		return broker.ContextFactory.create(broker);
	}
}
