'use strict';

import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
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
	const key = LendingProductConfigKeys.LendingProductConfig.AgeMin;

	let value = '25';
	const p: ProductConfig = await broker.call('v1.product.insertConfig', { productId, key, value }, opts);
	await ProductTestHelper.validateProductConfig(productId, key, value);

	value = '26';
	await broker.call('v1.product.updateConfig', { id: p.id, productId, key, value }, opts);
	await ProductTestHelper.validateProductConfig(productId, key, value);
	await ProductTestHelper.validateProductConfigUsingKey(productId, key, value);

	await broker.call('v1.product.deleteConfig', { id: p.id }, opts);
	const allConfig: ProductConfig[] = await broker.call('v1.product.getConfig', { productId }, opts);
	const pf = allConfig.filter((e) => e.productId === productId && e.key === key);

	expect(pf).toBeArrayOfTypeOfLength(ProductConfig, 0);
});

test('product document config e2e', async () => {
	const productId: string = Utility.newGuid();
	const documentCode = 'Aadhar';
	let mandatory: boolean = true;
	let description: string = Utility.getRandomString(10);

	const p: ProductConfig = await broker.call('v1.product.insertDocumentConfig', { productId, documentCode, mandatory, description }, opts);
	await ProductTestHelper.validateProductDocumentConfig(productId, documentCode, mandatory, description);

	mandatory = false;
	description = Utility.getRandomString(10);
	await broker.call('v1.product.updateDocumentConfig', { id: p.id, productId, documentCode, mandatory, description }, opts);
	await ProductTestHelper.validateProductDocumentConfig(productId, documentCode, mandatory, description);

	await broker.call('v1.product.deleteDocumentConfig', { id: p.id }, opts);
	const allConfig: ProductDocument[] = await broker.call('v1.product.getDocumentConfig', { productId }, opts);
	const pf = allConfig.filter((e) => e.productId === productId && e.documentCode === documentCode);

	expect(pf).toBeArrayOfTypeOfLength(ProductDocument, 0);
});

class ProductTestHelper {
	static async validateProductConfig(productId: string, key: string, value: any) {
		const p: ProductConfig[] = await broker.call('v1.product.getConfig', { productId }, opts);
		const pf = p.filter((e) => e.productId === productId && e.key === key);

		expect(pf).toBeArrayOfTypeOfLength(ProductConfig, 1);

		expect(pf[0].id).toBeUuid();
		expect(pf[0].value).toBe(value);
	}

	static async validateProductConfigUsingKey(productId: string, key: string, value: any) {
		const p: ProductConfig = await broker.call('v1.product.getConfigForKey', { productId, key }, opts);

		expect(p.id).toBeUuid();
		expect(p.productId).toBe(productId);
		expect(p.key).toBe(key);
		expect(p.value).toBe(value);
	}

	static async validateProductDocumentConfig(productId: string, documentCode: string, mandatory: boolean, description: string) {
		const p: ProductDocument[] = await broker.call('v1.product.getDocumentConfig', { productId }, opts);
		const pf = p.filter((e) => e.productId === productId && e.documentCode === documentCode);

		expect(pf).toBeArrayOfTypeOfLength(ProductDocument, 1);

		expect(pf[0].id).toBeUuid();
		expect(pf[0].mandatory).toBe(mandatory);
		expect(pf[0].description).toBe(description);
	}
}
