export function createElement(tag, ...nodes) {
	let element = document.createElement(tag);
	element.append(...nodes);
	return element;
}