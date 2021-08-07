export function sanitize(string: string) {
	const map: any = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'`': '&grave;',
		'/': '&#x2F;',
	};
	const reg = /[&<>"'/`]/gi;
	return string.replace(reg, (match) => map[match]);
}

export const switchFn =
	(lookupObject: any, defaultCase = '_default') =>
	(expression: string) =>
		(lookupObject[expression] || lookupObject[defaultCase])();

export function setAttributes(el: Element, attrs: { [key: string]: string }) {
	for (var key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}
