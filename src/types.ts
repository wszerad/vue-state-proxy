export interface StateOptions {
	name: string;
	computed: FunctionsMap;
	methods: FunctionsMap;
	data: () => any;
}

export interface TypesMap {
	[key: string]: any;
}

export interface FunctionsMap {
	[key: string]: any;
}