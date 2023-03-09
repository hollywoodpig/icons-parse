export default {
	plugins: [
		'removeDimensions',
		{
			name: 'addAttributesToSVGElement',
			params: { attributes: ['id="icon"'] },
		},
	],
};
