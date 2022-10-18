import { Blob } from 'node:buffer';
import atob from 'atob';

export default (dataUrl: string) => {
	const arr = dataUrl.split(','),
		mime = arr[0]?.match(/:(.*?);/)?.[1],
		bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], mime ? { type: mime } : undefined);
};
