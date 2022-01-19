export class CollectionCompareResult<T> {
	inserts?: T[];
	updates?: T[];
	deletes?: T[];
}

export class CollectionCompare<T> {
	private result?: CollectionCompareResult<T>;

	public compare(collection1: T[], collection2: T[]) {}
}
