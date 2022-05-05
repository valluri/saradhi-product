'use strict';

import { Product } from '@Entities/product/product';
import { ProductConfig } from '@Entities/product/product-config';
import { ProductDocument } from '@Entities/product/product-document';
import { ProductPreference } from '@Entities/product/product-preference';
import PartnerService from '@MicroServices/partner.service';
import ProductService from '@MicroServices/product.service';
import { ProductPreferenceType } from '@ServiceHelpers/enums';
import { LendingProductConfigKeys } from '@ServiceHelpers/product-config-keys';
import { JourneyType, PagedResponse, Utility } from '@valluri/saradhi-library';
import TestHelper from './helpers/helper';

const broker = TestHelper.getBroker([ProductService, PartnerService]);
let opts = {};

beforeAll(async () => {
	opts = await TestHelper.startBroker(broker);
});

afterAll(async () => TestHelper.stopBroker(broker));

test('product  e2e', async () => {
	const p: Product = new Product();
	p.name = Utility.getRandomString(10);
	p.code = Utility.getRandomString(5);
	p.partnerId = Utility.getRandomString(5);
	p.journeyType = JourneyType.LeadOnly;

	const savedProduct: Product = await broker.call('v1.product.insertProduct', p, opts);
	await ProductTestHelper.validateProduct(p);

	savedProduct.name = Utility.getRandomString(10);
	await broker.call('v1.product.updateProduct', savedProduct, opts);
	await ProductTestHelper.validateProduct(savedProduct);

	await broker.call('v1.product.deleteProduct', { id: savedProduct.id }, opts);
	const allProducts: PagedResponse<Product> = await broker.call('v1.product.getProducts', {}, opts);
	const pf = allProducts.items.filter((e) => e.code === p.code);

	expect(pf).toBeArrayOfTypeOfLength(Product, 0);
});

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

test('product preference e2e', async () => {
	let p1: ProductPreference = new ProductPreference();
	p1.productId = Utility.newGuid();
	p1.type = ProductPreferenceType.PinCode;
	p1.positive = ['1', '2', '3'];
	p1.negative = ['10', '20', '30'];

	const savedPref: ProductPreference = await broker.call('v1.product.insertProductPreference', p1, opts);
	await ProductTestHelper.validateProductPreference(p1);

	savedPref.positive = ['4', '5', '6'];
	savedPref.negative = ['40', '50', '60'];
	await broker.call('v1.product.updateProductPreference', savedPref, opts);
	await ProductTestHelper.validateProductPreference(savedPref);

	// positive
	await ProductTestHelper.validateProductPreferenceValue(p1.productId, p1.type, '4', true);

	// negative
	await ProductTestHelper.validateProductPreferenceValue(p1.productId, p1.type, '40', false);

	// absent config
	await ProductTestHelper.validateProductPreferenceValue(p1.productId, ProductPreferenceType.Industry, '4', true);

	// no positives. so all are allowed
	p1.type = ProductPreferenceType.Occupation;
	p1.positive = [];
	await broker.call('v1.product.insertProductPreference', p1, opts);
	await ProductTestHelper.validateProductPreferenceValue(p1.productId, p1.type, '4', true);
});

class ProductTestHelper {
	static async validateProduct(p: Product) {
		const allProducts: PagedResponse<Product> = await broker.call('v1.product.getProducts', {}, opts);
		const pf = allProducts.items.filter((e) => e.code === p.code);

		expect(pf).toBeArrayOfTypeOfLength(Product, 1);

		expect(pf[0].id).toBeUuid();
		expect(pf[0].name).toBe(p.name);
		expect(pf[0].partnerId).toBe(p.partnerId);
		expect(pf[0].journeyType).toBe(p.journeyType);
		expect(pf[0].priority).toBe(p.priority);
		expect(pf[0].preQualAction).toBe(p.preQualAction);
		expect(pf[0].eligibilityAction).toBe(p.eligibilityAction);
	}

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

	static async validateProductPreference(p: ProductPreference) {
		const pf: ProductPreference = await broker.call('v1.product.getProductPreference', { productId: p.productId, type: p.type }, opts);

		expect(pf).toBeOfType(ProductPreference);

		expect(pf.id).toBeUuid();
		expect(pf.productId).toBe(p.productId);
		expect(pf.type).toBe(p.type);
		expect(pf.positive).toStrictEqual(p.positive);
		expect(pf.negative).toStrictEqual(p.negative);
	}

	static async validateProductPreferenceValue(productId: string, type: ProductPreferenceType, valueToCheck: string, expectedResult: boolean) {
		const allowed: boolean = await broker.call('v1.product.isPreferenceAllowed', { productId, type, valueToCheck }, opts);
		expect(allowed).toBe(expectedResult);
	}
}
