'use strict';

import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([]);
let opts = {};

beforeAll(async () => {
	opts = await TestHelper.startBroker(broker);
});

afterAll(async () => await TestHelper.stopBroker(broker));

test('e2e', async () => {
	for (let index = 0; index < 10; index++) {
		await broker.call('v1.channel.send', { id: index }, opts);
	}
});
