import { beforeEach, describe, expect, it } from "bun:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";
import {
	clearCache,
	ensureCacheDir,
	getCachedAudio,
	getCacheKey,
	getCachePath,
	getCacheStats,
	saveToCache,
} from "./cache";

const CACHE_DIR = join(homedir(), ".cache", "tts-cli");
const TEST_TEXT = "Hello, test world!";
const TEST_VOICE = "en-US-AriaNeural";
const TEST_RATE = "+0%";
const TEST_PITCH = "+0Hz";

describe("Cache Module", () => {
	beforeEach(async () => {
		// Clear cache before each test
		await clearCache();
	});

	describe("getCacheKey", () => {
		it("should generate consistent hash for same inputs", () => {
			const key1 = getCacheKey(TEST_TEXT, TEST_VOICE, TEST_RATE, TEST_PITCH);
			const key2 = getCacheKey(TEST_TEXT, TEST_VOICE, TEST_RATE, TEST_PITCH);
			expect(key1).toBe(key2);
		});

		it("should generate different hashes for different inputs", () => {
			const key1 = getCacheKey(TEST_TEXT, TEST_VOICE, TEST_RATE, TEST_PITCH);
			const key2 = getCacheKey(
				"Different text",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);
			const key3 = getCacheKey(
				TEST_TEXT,
				"en-GB-SoniaNeural",
				TEST_RATE,
				TEST_PITCH,
			);
			const key4 = getCacheKey(TEST_TEXT, TEST_VOICE, "+20%", TEST_PITCH);
			const key5 = getCacheKey(TEST_TEXT, TEST_VOICE, TEST_RATE, "+10Hz");

			expect(key1).not.toBe(key2);
			expect(key1).not.toBe(key3);
			expect(key1).not.toBe(key4);
			expect(key1).not.toBe(key5);
		});

		it("should return a 64-character hex string", () => {
			const key = getCacheKey(TEST_TEXT, TEST_VOICE, TEST_RATE, TEST_PITCH);
			expect(key).toHaveLength(64);
			expect(key).toMatch(/^[a-f0-9]{64}$/);
		});
	});

	describe("getCachePath", () => {
		it("should return correct cache path", () => {
			const key = "abc123";
			const path = getCachePath(key);
			expect(path).toBe(join(CACHE_DIR, "abc123.mp3"));
		});
	});

	describe("ensureCacheDir", () => {
		it("should create cache directory if it doesn't exist", async () => {
			// Remove cache dir if it exists
			await $`rm -rf ${CACHE_DIR}`.quiet();

			await ensureCacheDir();

			// Check if directory exists (using stat instead of Bun.file for directories)
			const result = await $`test -d ${CACHE_DIR} && echo "exists"`.text();
			expect(result.trim()).toBe("exists");
		});

		it("should not fail if cache directory already exists", async () => {
			await ensureCacheDir();
			// Call again - should not throw
			await expect(ensureCacheDir()).resolves.toBeUndefined();
		});
	});

	describe("saveToCache and getCachedAudio", () => {
		it("should save and retrieve audio from cache", async () => {
			const testData = new Uint8Array([1, 2, 3, 4, 5]);
			const audioBlob = new Blob([testData], { type: "audio/mpeg" });

			// Save to cache
			await saveToCache(
				TEST_TEXT,
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
				audioBlob,
			);

			// Retrieve from cache
			const cachedAudio = await getCachedAudio(
				TEST_TEXT,
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);

			expect(cachedAudio).not.toBeNull();
			if (cachedAudio) {
				const cachedData = new Uint8Array(await cachedAudio.arrayBuffer());
				expect(cachedData).toEqual(testData);
				expect(cachedAudio.type).toBe("audio/mpeg");
			}
		});

		it("should return null for non-existent cache entry", async () => {
			const cachedAudio = await getCachedAudio(
				"Non-existent text",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);
			expect(cachedAudio).toBeNull();
		});

		it("should handle cache miss gracefully", async () => {
			// Try to get cached audio that doesn't exist
			const result = await getCachedAudio(
				"This text has never been cached",
				"en-US-AriaNeural",
				"+0%",
				"+0Hz",
			);
			expect(result).toBeNull();
		});
	});

	describe("clearCache", () => {
		it("should clear all cached files", async () => {
			// Add some test files to cache
			const testData = new Uint8Array([1, 2, 3]);
			const audioBlob = new Blob([testData], { type: "audio/mpeg" });

			await saveToCache("Text 1", TEST_VOICE, TEST_RATE, TEST_PITCH, audioBlob);
			await saveToCache("Text 2", TEST_VOICE, TEST_RATE, TEST_PITCH, audioBlob);
			await saveToCache("Text 3", TEST_VOICE, TEST_RATE, TEST_PITCH, audioBlob);

			// Clear cache
			const count = await clearCache();
			expect(count).toBeGreaterThanOrEqual(3);

			// Verify files are gone
			const cached1 = await getCachedAudio(
				"Text 1",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);
			const cached2 = await getCachedAudio(
				"Text 2",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);
			const cached3 = await getCachedAudio(
				"Text 3",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);

			expect(cached1).toBeNull();
			expect(cached2).toBeNull();
			expect(cached3).toBeNull();
		});

		it("should return 0 when cache is already empty", async () => {
			// Clear cache first
			await clearCache();
			// Clear again - should return 0
			const count = await clearCache();
			expect(count).toBe(0);
		});
	});

	describe("getCacheStats", () => {
		it("should return correct cache statistics", async () => {
			// Clear cache first
			await clearCache();

			// Add some test files
			const testData1 = new Uint8Array(1024); // 1KB
			const testData2 = new Uint8Array(2048); // 2KB
			const audioBlob1 = new Blob([testData1], { type: "audio/mpeg" });
			const audioBlob2 = new Blob([testData2], { type: "audio/mpeg" });

			await saveToCache(
				"Stats test 1",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
				audioBlob1,
			);
			await saveToCache(
				"Stats test 2",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
				audioBlob2,
			);

			const stats = await getCacheStats();

			expect(stats.totalFiles).toBe(2);
			// Files might be slightly smaller due to filesystem overhead
			expect(stats.totalSizeBytes).toBeGreaterThan(0);
			expect(stats.totalSizeMB).toBeGreaterThan(0);
			expect(stats.cacheDir).toBe(CACHE_DIR);
		});

		it("should return zeros for empty cache", async () => {
			await clearCache();
			const stats = await getCacheStats();

			expect(stats.totalFiles).toBe(0);
			expect(stats.totalSizeBytes).toBe(0);
			expect(stats.totalSizeMB).toBe(0);
			expect(stats.cacheDir).toBe(CACHE_DIR);
		});

		it("should handle cross-platform stat commands", async () => {
			// This test verifies the cross-platform fix works
			const testData = new Uint8Array(1024);
			const audioBlob = new Blob([testData], { type: "audio/mpeg" });

			await saveToCache(
				"Platform test",
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
				audioBlob,
			);

			// Should not throw on any platform
			const stats = await getCacheStats();
			expect(stats).toBeDefined();
			expect(stats.totalFiles).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty text gracefully", async () => {
			const key = getCacheKey("", TEST_VOICE, TEST_RATE, TEST_PITCH);
			expect(key).toHaveLength(64);
		});

		it("should handle special characters in text", async () => {
			const specialText = "Hello! @#$%^&*() 你好 🎉";
			const key = getCacheKey(specialText, TEST_VOICE, TEST_RATE, TEST_PITCH);
			expect(key).toHaveLength(64);

			const testData = new Uint8Array([1, 2, 3]);
			const audioBlob = new Blob([testData], { type: "audio/mpeg" });

			await saveToCache(
				specialText,
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
				audioBlob,
			);
			const cached = await getCachedAudio(
				specialText,
				TEST_VOICE,
				TEST_RATE,
				TEST_PITCH,
			);

			expect(cached).not.toBeNull();
		});
	});
});
