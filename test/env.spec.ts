'use strict';

import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([]);

beforeAll(async () => {
	await TestHelper.startBroker(broker);
});

afterAll(async () => {
	await TestHelper.stopBroker(broker);
});

test('env', async () => {
	TestHelper.testEnv('ENV_KEY', 'ENV_VALUE');
});

test('env.local', async () => {
	TestHelper.testEnv('ENV_LOCAL_KEY', 'ENV_LOCAL_VALUE');
});

test('env.e2e', async () => {
	TestHelper.testEnv('ENV_E2E_KEY', 'ENV_E2E_VALUE');
});
