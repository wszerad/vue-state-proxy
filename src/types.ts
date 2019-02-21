export interface StateOptions {
	name: string;
	modules: TypesMap;
	proto: FunctionsMap;
}

export interface TypesMap {
	[key: string]: any;
}

export interface FunctionsMap {
	[key: string]: any;
}