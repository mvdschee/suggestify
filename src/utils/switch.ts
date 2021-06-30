export const switchFn =
	(lookupObject: any, defaultCase = '_default') =>
	(expression: string) =>
		(lookupObject[expression] || lookupObject[defaultCase])();
