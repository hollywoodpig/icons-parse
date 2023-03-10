export default {
	plugins: [
		'preset-default',
		'removeDimensions',
		{
			name: 'addAttributesToSVGElement',
			params: {
				attributes: ['id="icon"', 'style="stroke-width: var(--stroke, 2);"'],
			},
		},
		{
			name: 'convertColors',
			params: {
				currentColor: true,
			},
		},
	],
};
