export default {
	plugins: [
		'preset-default',
		'removeDimensions',
		{
			name: 'addAttributesToSVGElement',
			params: { attributes: ['id="icon"'] },
		},
		{
			name: 'convertColors',
			params: {
				currentColor: true,
			},
		},
	],
};
