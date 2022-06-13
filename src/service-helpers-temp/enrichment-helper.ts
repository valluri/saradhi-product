// import { Constants, KeyValuePair2, PagedResponse } from '@valluri/saradhi-library';
// import _ from 'lodash';
// import { Context } from 'moleculer';

// export class EnrichmentHelper {
// 	private static PARAM_ARRAY = 'array';
// 	private static PARAM_PAGED_RESPONSE = 'paged';
// 	private static PARAM_NORMAL = 'normal';

// 	public static async enrich<T>(ctx: Context, entities: T, enrichmentFields: string[], actionToFetchData: string): Promise<T>;

// 	public static async enrich<T>(ctx: Context, entities: T[], enrichmentFields: string[], actionToFetchData: string): Promise<T[]>;

// 	public static async enrich<T>(
// 		ctx: Context,
// 		entities: PagedResponse<T>,
// 		enrichmentFields: string[],
// 		actionToFetchData: string,
// 	): Promise<PagedResponse<T>>;

// 	public static async enrich<T>(
// 		ctx: Context,
// 		entities: T | T[] | PagedResponse<T>,
// 		enrichmentFields: string[],
// 		actionToFetchData: string,
// 	): Promise<T | T[] | PagedResponse<T>> {
// 		enrichmentFields.push(Constants.CREATED_BY);
// 		enrichmentFields.push(Constants.MODIFIED_BY);

// 		const paramType: string = EnrichmentHelper.getParamType(entities);

// 		// work with a local copy
// 		let localEntities = entities as any;

// 		if (paramType === EnrichmentHelper.PARAM_NORMAL) {
// 			// convert to array
// 			localEntities = [entities];
// 		} else if (paramType === EnrichmentHelper.PARAM_PAGED_RESPONSE) {
// 			// get the actual items
// 			localEntities = (entities as any).items;
// 		}

// 		enrichmentFields = EnrichmentHelper.getEnrichmentFields(localEntities, enrichmentFields);

// 		if (enrichmentFields.length == 0) {
// 			return this.getReturnValue(paramType, entities, localEntities);
// 		}

// 		console.log('Enriching:', enrichmentFields.join(', '));

// 		// get the users-ids from the various fields
// 		const ids: string[] = EnrichmentHelper.getIds(localEntities, enrichmentFields);

// 		// fetch lookup data
// 		const lookupData: KeyValuePair2<string, string>[] = await ctx.call(actionToFetchData, { ids });

// 		// loop through each element to enrich
// 		localEntities.forEach((element: any) => {
// 			enrichmentFields.forEach((field: any) => {
// 				element = EnrichmentHelper.setValue(element, lookupData, field);
// 			});
// 		});

// 		return this.getReturnValue(paramType, entities, localEntities);
// 	}

// 	private static setValue(entity: any, lookupData: KeyValuePair2<string, string>[], idField: string): any {
// 		// get the id
// 		const id: string = entity[idField];

// 		const valueField = EnrichmentHelper.getValueField(idField);

// 		if (Array.isArray(id)) {
// 			// find the lookup values
// 			const lookupValueElems = lookupData.filter((e) => {
// 				return _.includes(id, e.key);
// 			});

// 			// set the name if the lookup is found
// 			entity[valueField] = lookupValueElems ? lookupValueElems : {};
// 		} else {
// 			// find the lookup value
// 			const lookupValueElem = lookupData.find((e) => {
// 				return e.key == id;
// 			});

// 			// set the name if the lookup is found
// 			entity[valueField] = lookupValueElem ? lookupValueElem.value : '';
// 		}

// 		return entity;
// 	}

// 	/**
// 	 * Checks if enrichment is needed and is possible. checks for the following conditions
// 	 * ensure input array has elements (if input is an array). returns no fields to enrich
// 	 * checks and returns fields which are present in the first element.
// 	 */
// 	private static getEnrichmentFields<T>(entities: T[], fieldsToEnrich: string[]): string[] {
// 		// return if no elements in the array
// 		if (entities.length == 0) {
// 			return [];
// 		}

// 		const firstElement: any = entities[0];

// 		return fieldsToEnrich.filter((p) => {
// 			// should have the id field and not have the value field.
// 			// prevents running the same enrichment the second time
// 			return firstElement.hasOwnProperty(p) && !firstElement.hasOwnProperty(EnrichmentHelper.getValueField(p));
// 		});
// 	}

// 	/**
// 	 * removes
// 	 * - null & undefined
// 	 * - blanks & empty spaces
// 	 * - duplicates
// 	 */
// 	private static getIds<T>(entities: T[], fields: string[]): string[] {
// 		let ids: string[] = [];

// 		// for each entity, get all required fields
// 		entities.forEach((entity: any) => {
// 			fields.forEach((field) => {
// 				const id = entity[field];

// 				if (Array.isArray(id)) {
// 					ids.push(...id);
// 				} else {
// 					ids.push(id);
// 				}
// 			});
// 		});

// 		// remove blank strings, null/undefined and null-uuid
// 		ids = ids.filter((e) => {
// 			return e && e.trim().length > 0 && e != Constants.NULL_UUID;
// 		});

// 		// get unique IDs
// 		return [...new Set(ids)];
// 	}

// 	private static getValueField(idField: string): string {
// 		return `${idField}__Name__`;
// 	}

// 	private static getParamType(entities: any): string {
// 		if (Array.isArray(entities)) {
// 			return EnrichmentHelper.PARAM_ARRAY;
// 		}
// 		if (entities.hasOwnProperty('total_count') && entities.hasOwnProperty('items')) {
// 			return EnrichmentHelper.PARAM_PAGED_RESPONSE;
// 		}
// 		return EnrichmentHelper.PARAM_NORMAL;
// 	}

// 	private static getReturnValue(paramType: string, entities: any, localEntities: any[]): any {
// 		if (paramType === EnrichmentHelper.PARAM_NORMAL) {
// 			return localEntities[0];
// 		} else if (paramType === EnrichmentHelper.PARAM_PAGED_RESPONSE) {
// 			(entities as any).items = localEntities;
// 			return entities;
// 		}
// 		return localEntities;
// 	}
// }
