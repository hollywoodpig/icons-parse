import translate from 'translate';
import path from 'path';
import glob from 'glob';
import replace from 'replace-in-file';
import fs from 'fs/promises';

export function* chunkify(arr, n) {
	for (let i = 0; i < arr.length; i += n) {
		yield arr.slice(i, i + n);
	}
}

export async function translateText(query) {
	const translated = await translate(query, {
		from: 'en',
		to: 'ru',
		cache: 100,
	});

	return translated;
}

export async function translateArray(arr, mock) {
	const chunks = [...chunkify(arr, 10)];
	const translatedChunks = [];

	for (const chunk of chunks) {
		const text = chunk.join('; ');
		const translatedText = mock
			? text.replace(/\w+/g, 'translated')
			: await translateText(text);
		const translatedChunk = translatedText.split('; ');

		translatedChunks.push(translatedChunk);
	}

	return translatedChunks.flat();
}

export async function formatIcons(source, name) {
	const files = await glob(source);

	await fs.mkdir(`dest/${name}`, { recursive: true });

	for (const file of files) {
		const basename = path.basename(file);

		await fs.copyFile(file, `dest/${name}/${basename}`);
	}

	await replace({
		files: `dest/${name}/*.svg`,
		from: '<svg',
		to: '<svg id="icon"',
	});
}
