/* eslint-disable complexity */
expect.extend({
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toBeOfType<T>(received: any, checkType: T) {
		try {
			const returnValue: T = received as unknown as T;
			expect(returnValue).toBeInstanceOf(checkType);
			return {
				message: () => `pass`,
				pass: true,
			};
		} catch (error) {
			return {
				message: () => `expected  ${typeof checkType}, recd ${typeof received}`,
				pass: false,
			};
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toBeArrayOfTypeWithMinLength<T>(received: any, checkType: T, minLength: number) {
		try {
			const returnValueArray: T[] = received as unknown as T[];

			expect(returnValueArray.length).toBeGreaterThanOrEqual(minLength);
			returnValueArray.forEach((element) => {
				expect(element).toBeInstanceOf(checkType);
			});
			return {
				message: () => `pass`,
				pass: true,
			};
		} catch (error) {
			return {
				message: () => `expected  ${typeof checkType}, recd ${typeof received}. ${error}`,
				pass: false,
			};
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	toBeArrayOfTypeOfLength<T>(received: any, checkType: T, length: number) {
		try {
			const returnValueArray: T[] = received as unknown as T[];

			expect(returnValueArray.length).toBe(length);
			returnValueArray.forEach((element) => {
				expect(element).toBeInstanceOf(checkType);
			});
			return {
				message: () => `pass`,
				pass: true,
			};
		} catch (error) {
			return {
				message: () => `expected  ${typeof checkType}, recd ${typeof received}. ${error}`,
				pass: false,
			};
		}
	},
	toBeStringOfMinLength(received: string, minLength: number) {
		try {
			expect(received.length).toBeGreaterThanOrEqual(minLength);
			return {
				message: () => `pass`,
				pass: true,
			};
		} catch (error) {
			return {
				message: () => `expected string of length ${minLength}, recd ${received}. ${error}`,
				pass: false,
			};
		}
	},

	toBeType(received, argument) {
		const initialType = typeof received;
		const type = initialType === 'object' ? (Array.isArray(received) ? 'array' : initialType) : initialType;
		return type === argument
			? {
					message: () => `expected ${received} to be type ${argument}`,
					pass: true,
			  }
			: {
					message: () => `expected ${received} to be type ${argument}`,
					pass: false,
			  };
	},

	toBeUuid(received) {
		if (received == null) {
			return {
				message: () => `expected ${received} to be type a uuid`,
				pass: true,
			};
		}
		let s: string = '' + received;

		const match = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
		if (match === null) {
			return {
				message: () => `expected ${received} to be type a uuid`,
				pass: false,
			};
		}
		return {
			message: () => `expected ${received} to be type a uuid`,
			pass: true,
		};
	},
});
