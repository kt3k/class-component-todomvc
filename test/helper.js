require('../src');

exports.trigger = (el, type, detail) => {
	$(el)[0].dispatchEvent(new CustomEvent(type, {detail, bubbles: true}));
};
