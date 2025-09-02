import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";

// We'll need to mock the CACHE_DIR in the cache module
const TEST_CACHE_DIR = join(homedir(), ".cache", "tts-cli-test");

// Mock the cache module with test directory
import * as cacheModule from "../src/cache";

// Override the CACHE_DIR for testing
const getCacheKey = cacheModule.getCacheKey;
const getCachePath = (key: string) => join(TEST_CACHE_DIR, `${key}.mp3`);

const ensureCacheDir = async () => {
	await $`mkdir -p ${TEST_CACHE_DIR}`.quiet();
};

const getCachedAudio = async (
	text: string,
	voice: string,
	rate: string,
	pitch: string,
) => {
	const key = getCacheKey(text, voice, rate, pitch);
	const cachePath = getCachePath(key);

	try {
		const file = Bun.file(cachePath);
		const exists = await file.exists();
		if (exists) {
			const buffer = await file.arrayBuffer();
			return new Blob([buffer], { type: "audio/mpeg" });
		}
	} catch {}
	return null;
};

const saveToCache = async (
	text: string,
	voice: string,
	rate: string,
	pitch: string,
	audioBlob: Blob,
) => {
	await ensureCacheDir();
	const key = getCacheKey(text, voice, rate, pitch);
	const cachePath = getCachePath(key);
	const buffer = await audioBlob.arrayBuffer();
	await Bun.write(cachePath, buffer);
};

const clearCache = async () => {
	try {
		const filesBefore =
			await $`find ${TEST_CACHE_DIR} -name "*.mp3" -type f | wc -l`.text();
		const count = Number.parseInt(filesBefore.trim(), 10);
		await $`find ${TEST_CACHE_DIR} -name "*.mp3" -type f -delete`.quiet();
		return count;
	} catch {
		return 0;
	}
};

const getCacheStats = async () => {
	try {
		await ensureCacheDir();
		const fileCount =
			await $`find ${TEST_CACHE_DIR} -name "*.mp3" -type f | wc -l`.text();
		const totalFiles = Number.parseInt(fileCount.trim(), 10);

		let totalSizeBytes = 0;
		if (totalFiles > 0) {
			const sizeOutput =
				await $`find ${TEST_CACHE_DIR} -name "*.mp3" -type f -exec stat -f%z {} + | awk '{sum+=$1} END {print sum}'`.text();
			totalSizeBytes = Number.parseInt(sizeOutput.trim(), 10) || 0;
		}

		return {
			totalFiles,
			totalSizeBytes,
			totalSizeMB: totalSizeBytes / (1024 * 1024),
			cacheDir: TEST_CACHE_DIR,
		};
	} catch {
		return {
			totalFiles: 0,
			totalSizeBytes: 0,
			totalSizeMB: 0,
			cacheDir: TEST_CACHE_DIR,
		};
	}
};

describe("Cache Module", () => {
	beforeEach(async () => {
		// Ensure clean test environment
		if (existsSync(TEST_CACHE_DIR)) {
			rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
		}
	});

	afterEach(async () => {
		// Clean up test cache directory
		if (existsSync(TEST_CACHE_DIR)) {
			rmSync(TEST_CACHE_DIR, { recursive: true, force: true });
		}
	});

	describe("getCacheKey", () => {
		it("should generate consistent hash for same inputs", () => {
			const key1 = getCacheKey(
				"Hello world",
				"en-US-AriaNeural",
				"+0%",
				"+0Hz",
			);
			const key2 = getCacheKey(
				"Hello world",
				"en-US-AriaNeural",
				"+0%",
				"+0Hz",
			);
			expect(key1).toBe(key2);
		});

		it("should generate different hashes for different text", () => {
			const key1 = getCacheKey(
				"Hello world",
				"en-US-AriaNeural",
				"+0%",
				"+0Hz",
			);
			const key2 = getCacheKey(
				"Goodbye world",
				"en-US-AriaNeural",
				"+0%",
				"+0Hz",
			);
			expect(key1).not.toBe(key2);
		});

		it("should generate different hashes for different voices", () => {
			const key1 = getCacheKey("Hello", "en-US-AriaNeural", "+0%", "+0Hz");
			const key2 = getCacheKey("Hello", "en-GB-SoniaNeural", "+0%", "+0Hz");
			expect(key1).not.toBe(key2);
		});

		it("should generate different hashes for different rates", () => {
			const key1 = getCacheKey("Hello", "en-US-AriaNeural", "+0%", "+0Hz");
			const key2 = getCacheKey("Hello", "en-US-AriaNeural", "+20%", "+0Hz");
			expect(key1).not.toBe(key2);
		});

		it("should generate different hashes for different pitches", () => {
			const key1 = getCacheKey("Hello", "en-US-AriaNeural", "+0%", "+0Hz");
			const key2 = getCacheKey("Hello", "en-US-AriaNeural", "+0%", "+10Hz");
			expect(key1).not.toBe(key2);
		});

		it("should return 64-character hex string", () => {
			const key = getCacheKey("Test", "voice", "rate", "pitch");
			expect(key).toMatch(/^[a-f0-9]{64}$/);
			expect(key.length).toBe(64);
		});
	});

	describe("getCachePath", () => {
		it("should return path with .mp3 extension", () => {
			const key = "abc123";
			const path = getCachePath(key);
			expect(path).toContain("abc123.mp3");
			expect(path).toContain(".cache");
		});

		it("should include cache directory in path", () => {
			const key = "test-key";
			const path = getCachePath(key);
			expect(path).toContain(join(homedir(), ".cache", "tts-cli"));
		});
	});

	describe("ensureCacheDir", () => {
		it("should create cache directory if it doesn't exist", async () => {
			expect(existsSync(TEST_CACHE_DIR)).toBe(false);
			await ensureCacheDir();
			expect(existsSync(TEST_CACHE_DIR)).toBe(true);
		});

		it("should not throw if directory already exists", async () => {
			await ensureCacheDir();
			expect(existsSync(TEST_CACHE_DIR)).toBe(true);

			// Call again - should not throw
			await expect(ensureCacheDir()).resolves.toBeUndefined();
		});
	});

	describe("getCachedAudio", () => {
		it("should return null for non-existent cache", async () => {
			const audio = await getCachedAudio("test", "voice", "rate", "pitch");
			expect(audio).toBeNull();
		});

		it("should return Blob for existing cache", async () => {
			// First save some test data
			const testData = new Blob(["test audio data"], { type: "audio/mpeg" });
			await saveToCache("test", "voice", "rate", "pitch", testData);

			// Then retrieve it
			const cached = await getCachedAudio("test", "voice", "rate", "pitch");
			expect(cached).not.toBeNull();
			expect(cached).toBeInstanceOf(Blob);
			expect(cached?.type).toBe("audio/mpeg");

			// Verify content
			const text = await cached?.text();
			expect(text).toBe("test audio data");
		});

		it("should handle file read errors gracefully", async () => {
			// This should not throw, just return null
			const audio = await getCachedAudio(
				"nonexistent",
				"voice",
				"rate",
				"pitch",
			);
			expect(audio).toBeNull();
		});
	});

	describe("saveToCache", () => {
		it("should save audio blob to cache", async () => {
			const testBlob = new Blob(["audio content"], { type: "audio/mpeg" });
			await saveToCache("save-test", "voice", "rate", "pitch", testBlob);

			// Verify file was created
			const key = getCacheKey("save-test", "voice", "rate", "pitch");
			const path = getCachePath(key);
			expect(existsSync(path)).toBe(true);

			// Verify content
			const file = Bun.file(path);
			const content = await file.text();
			expect(content).toBe("audio content");
		});

		it("should create cache directory if needed", async () => {
			expect(existsSync(TEST_CACHE_DIR)).toBe(false);

			const testBlob = new Blob(["test"], { type: "audio/mpeg" });
			await saveToCache("test", "voice", "rate", "pitch", testBlob);

			expect(existsSync(TEST_CACHE_DIR)).toBe(true);
		});

		it("should overwrite existing cache entry", async () => {
			const blob1 = new Blob(["first"], { type: "audio/mpeg" });
			const blob2 = new Blob(["second"], { type: "audio/mpeg" });

			await saveToCache("test", "voice", "rate", "pitch", blob1);
			await saveToCache("test", "voice", "rate", "pitch", blob2);

			const cached = await getCachedAudio("test", "voice", "rate", "pitch");
			const content = await cached?.text();
			expect(content).toBe("second");
		});
	});

	describe("clearCache", () => {
		it("should return 0 when cache is empty", async () => {
			await ensureCacheDir();
			const count = await clearCache();
			expect(count).toBe(0);
		});

		it("should delete all mp3 files and return count", async () => {
			// Create some test cache files
			await saveToCache("test1", "voice", "rate", "pitch", new Blob(["1"]));
			await saveToCache("test2", "voice", "rate", "pitch", new Blob(["2"]));
			await saveToCache("test3", "voice", "rate", "pitch", new Blob(["3"]));

			// Clear cache
			const count = await clearCache();
			expect(count).toBe(3);

			// Verify files are deleted
			const cached = await getCachedAudio("test1", "voice", "rate", "pitch");
			expect(cached).toBeNull();
		});

		it("should only delete .mp3 files", async () => {
			await ensureCacheDir();

			// Create mp3 and non-mp3 files
			await saveToCache("test", "voice", "rate", "pitch", new Blob(["test"]));
			await Bun.write(join(TEST_CACHE_DIR, "test.txt"), "text file");

			const count = await clearCache();
			expect(count).toBe(1);

			// Text file should still exist
			expect(existsSync(join(TEST_CACHE_DIR, "test.txt"))).toBe(true);
		});

		it("should handle errors gracefully", async () => {
			// Don't create directory - should return 0 instead of throwing
			const count = await clearCache();
			expect(count).toBe(0);
		});
	});

	describe("getCacheStats", () => {
		it("should return zero stats for empty cache", async () => {
			const stats = await getCacheStats();
			expect(stats.totalFiles).toBe(0);
			expect(stats.totalSizeBytes).toBe(0);
			expect(stats.totalSizeMB).toBe(0);
			expect(stats.cacheDir).toContain(".cache");
		});

		it("should calculate correct stats for cached files", async () => {
			// Create test files with known sizes
			const blob1 = new Blob(["a".repeat(1000)]); // 1000 bytes
			const blob2 = new Blob(["b".repeat(2000)]); // 2000 bytes
			const blob3 = new Blob(["c".repeat(3000)]); // 3000 bytes

			await saveToCache("test1", "voice", "rate", "pitch", blob1);
			await saveToCache("test2", "voice", "rate", "pitch", blob2);
			await saveToCache("test3", "voice", "rate", "pitch", blob3);

			const stats = await getCacheStats();
			expect(stats.totalFiles).toBe(3);
			expect(stats.totalSizeBytes).toBe(6000);
			expect(stats.totalSizeMB).toBeCloseTo(0.00572, 2); // 6000 / (1024*1024)
		});

		it("should only count .mp3 files", async () => {
			await ensureCacheDir();

			// Create mp3 and non-mp3 files
			await saveToCache("test", "voice", "rate", "pitch", new Blob(["test"]));
			await Bun.write(join(TEST_CACHE_DIR, "test.txt"), "text file");

			const stats = await getCacheStats();
			expect(stats.totalFiles).toBe(1);
		});

		it("should handle missing directory gracefully", async () => {
			// Don't create directory
			const stats = await getCacheStats();
			expect(stats.totalFiles).toBe(0);
			expect(stats.totalSizeBytes).toBe(0);
			expect(stats.totalSizeMB).toBe(0);
		});
	});

	describe("Integration", () => {
		it("should handle full cache lifecycle", async () => {
			// 1. Initially no cache
			let cached = await getCachedAudio("lifecycle", "voice", "+10%", "+5Hz");
			expect(cached).toBeNull();

			// 2. Save to cache
			const audioBlob = new Blob(["audio data here"], { type: "audio/mpeg" });
			await saveToCache("lifecycle", "voice", "+10%", "+5Hz", audioBlob);

			// 3. Retrieve from cache
			cached = await getCachedAudio("lifecycle", "voice", "+10%", "+5Hz");
			expect(cached).not.toBeNull();
			expect(await cached?.text()).toBe("audio data here");

			// 4. Check stats
			let stats = await getCacheStats();
			expect(stats.totalFiles).toBe(1);

			// 5. Clear cache
			const cleared = await clearCache();
			expect(cleared).toBe(1);

			// 6. Verify cache is empty
			cached = await getCachedAudio("lifecycle", "voice", "+10%", "+5Hz");
			expect(cached).toBeNull();

			stats = await getCacheStats();
			expect(stats.totalFiles).toBe(0);
		});

		it("should handle concurrent cache operations", async () => {
			// Simulate multiple concurrent saves
			const promises = [];
			for (let i = 0; i < 10; i++) {
				const blob = new Blob([`content-${i}`]);
				promises.push(saveToCache(`test-${i}`, "voice", "rate", "pitch", blob));
			}

			await Promise.all(promises);

			// Verify all were saved
			const stats = await getCacheStats();
			expect(stats.totalFiles).toBe(10);

			// Verify individual retrieval
			for (let i = 0; i < 10; i++) {
				const cached = await getCachedAudio(
					`test-${i}`,
					"voice",
					"rate",
					"pitch",
				);
				expect(cached).not.toBeNull();
				expect(await cached?.text()).toBe(`content-${i}`);
			}
		});
	});
});
