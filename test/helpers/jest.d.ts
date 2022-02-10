declare namespace jest {
	interface Matchers<R> {
		toBeOfType<T>(a: T): R;
		toBeArrayOfTypeWithMinLength<T>(a: T, b: number): R;
		toBeStringOfMinLength(a: number): R;
		toBeArrayOfTypeOfLength<T>(a: T, b: number): R;
		toBeUuid(): R;
	}
}
