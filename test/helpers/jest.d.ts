declare namespace jest {
	interface Matchers<R> {
		toBeOfType<T>(a: T): R;
	}

	interface Matchers<R> {
		toBeArrayOfTypeWithMinLength<T>(a: T, b: number): R;
	}

	interface Matchers<R> {
		toBeStringOfMinLength(a: number): R;
	}

	interface Matchers<R> {
		toBeArrayOfTypeOfLength<T>(a: T, b: number): R;
	}

	interface Matchers<R> {
		toBeUuid(): R;
	}
}
