import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

const CACHE_DIR = join(homedir(), ".cache", "tts-cli");

export interface CacheStats {
	totalFiles: number;
	totalSizeBytes: number;
	totalSizeMB: number;
	cacheDir: string;
}

export function getCacheKey(
	text: string,
	voice: string,
	rate: string,
	pitch: string,
): string {
	const input = `${text}|${voice}|${rate}|${pitch}`;
	const hash = createHash("sha256");
	hash.update(input);
	return hash.digest("hex");
}

export function getCachePath(key: string): string {
	return join(CACHE_DIR, `${key}.mp3`);
}

export async function ensureCacheDir(): Promise<void> {
	try {
		await $`mkdir -p ${CACHE_DIR}`.quiet();
	} catch (error) {
		throw new Error(`Failed to create cache directory: ${error}`);
	}
}

export async function getCachedAudio(
	text: string,
	voice: string,
	rate: string,
	pitch: string,
): Promise<Blob | null> {
	const key = getCacheKey(text, voice, rate, pitch);
	const cachePath = getCachePath(key);

	try {
		const file = Bun.file(cachePath);
		const exists = await file.exists();

		if (exists) {
			const buffer = await file.arrayBuffer();
			return new Blob([buffer], { type: "audio/mpeg" });
		}
	} catch {
		// File doesn't exist or can't be read
	}

	return null;
}

export async function saveToCache(
	text: string,
	voice: string,
	rate: string,
	pitch: string,
	audioBlob: Blob,
): Promise<void> {
	await ensureCacheDir();

	const key = getCacheKey(text, voice, rate, pitch);
	const cachePath = getCachePath(key);

	try {
		const buffer = await audioBlob.arrayBuffer();
		await Bun.write(cachePath, buffer);
	} catch (error) {
		console.warn(`Failed to save to cache: ${error}`);
	}
}

export async function clearCache(): Promise<number> {
	try {
		// Count files before deletion
		const filesBefore =
			await $`find ${CACHE_DIR} -name "*.mp3" -type f | wc -l`.text();
		const count = Number.parseInt(filesBefore.trim(), 10) || 0;

		// Delete files only if there are files to delete
		if (count > 0) {
			await $`find ${CACHE_DIR} -name "*.mp3" -type f -delete`.quiet();
		}

		return count;
	} catch (error) {
		console.warn(`Failed to clear cache: ${error}`);
		return 0;
	}
}

export async function getCacheStats(): Promise<CacheStats> {
	try {
		await ensureCacheDir();

		const fileCount =
			await $`find ${CACHE_DIR} -name "*.mp3" -type f | wc -l`.text();
		const totalFiles = Number.parseInt(fileCount.trim(), 10) || 0;

		let totalSizeBytes = 0;
		if (totalFiles > 0) {
			// Cross-platform stat command - need to handle differently
			if (process.platform === "darwin") {
				const sizeOutput =
					await $`find ${CACHE_DIR} -name "*.mp3" -type f -exec stat -f%z {} + | awk '{sum+=$1} END {print sum}'`.text();
				const parsedSize = Number.parseInt(sizeOutput.trim(), 10);
				totalSizeBytes = Number.isNaN(parsedSize) ? 0 : parsedSize;
			} else {
				const sizeOutput =
					await $`find ${CACHE_DIR} -name "*.mp3" -type f -exec stat -c%s {} + | awk '{sum+=$1} END {print sum}'`.text();
				const parsedSize = Number.parseInt(sizeOutput.trim(), 10);
				totalSizeBytes = Number.isNaN(parsedSize) ? 0 : parsedSize;
			}
		}

		return {
			totalFiles,
			totalSizeBytes,
			totalSizeMB: totalSizeBytes / (1024 * 1024),
			cacheDir: CACHE_DIR,
		};
	} catch (error) {
		console.warn(`Failed to get cache stats: ${error}`);
		return {
			totalFiles: 0,
			totalSizeBytes: 0,
			totalSizeMB: 0,
			cacheDir: CACHE_DIR,
		};
	}
}
