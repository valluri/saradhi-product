'use strict';

import { ProductConfig } from '@Entities/product/product-config';
import ProductService from '@MicroServices/product.service';
import { LendingProductConfigKeys } from '@ServiceHelpers/product-config-keys';
import { Utility } from '@valluri/saradhi-library';
import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([ProductService]);
let opts = {};

beforeAll(async () => {
	opts = await TestHelper.startBroker(broker);
});

afterAll(async () => await broker.stop());

test('product config e2e', async () => {
	const productId: string = Utility.newGuid();
	const p = {
		config: [
			{
				productId,
				key: LendingProductConfigKeys.LendingProductConfig.AgeMin,
				value: '17',
			},
			{
				productId,
				key: LendingProductConfigKeys.LendingProductConfig.AgeMax,
				value: '60',
			},
		],
	};

	const returnValue: ProductConfig[] = await broker.call('v1.product.saveConfig2', p, opts);
	expect(returnValue).toBeArrayOfTypeOfLength(ProductConfig, 2);

	expect(returnValue[0].id).toBeUuid();
	expect(returnValue[0].productId).toBe(productId);
	expect(returnValue[0].key).toBe(LendingProductConfigKeys.LendingProductConfig.AgeMin);
	expect(returnValue[0].value).toBe('17');
});
