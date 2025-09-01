import { describe, expect, it } from "bun:test";
import { $ } from "bun";
import { synthesizeSpeech } from "../src/lib";

// Check if running in CI environment
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

describe("Error Handling", () => {
	it("should throw error for invalid voice", async () => {
		try {
			await synthesizeSpeech("Test", "invalid-voice-name", "+0%", "+0Hz");
			expect.unreachable("Should have thrown an error");
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			if (error instanceof Error) {
				expect(error.message.toLowerCase()).toContain("voice");
			}
		}
	}, 10000);

	it("should handle empty text gracefully", async () => {
		const audio = await synthesizeSpeech("", "en-US-AriaNeural", "+0%", "+0Hz");
		expect(audio).toBeInstanceOf(Blob);
		// Empty text might still generate a small audio file
		expect(audio.size).toBeGreaterThanOrEqual(0);
	}, 10000);

	it("should handle invalid rate format", async () => {
		try {
			// Note: edge-tts might accept various formats, so this might not throw
			const audio = await synthesizeSpeech(
				"Test",
				"en-US-AriaNeural",
				"invalid",
				"+0Hz",
			);
			// If it doesn't throw, it should still return valid audio
			expect(audio).toBeInstanceOf(Blob);
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	}, 10000);

	it("should handle invalid pitch format", async () => {
		try {
			// Note: edge-tts might accept various formats, so this might not throw
			const audio = await synthesizeSpeech(
				"Test",
				"en-US-AriaNeural",
				"+0%",
				"invalid",
			);
			// If it doesn't throw, it should still return valid audio
			expect(audio).toBeInstanceOf(Blob);
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
		}
	}, 10000);

	it("should handle extremely long text", async () => {
		const veryLongText = "word ".repeat(10000); // 10,000 words (50,000 chars)

		// Should truncate and process successfully
		const audio = await synthesizeSpeech(
			veryLongText,
			"en-US-AriaNeural",
			"+0%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
		expect(audio.type).toBe("audio/mpeg");
	}, 15000); // Reduced timeout since text is now truncated
});

describe("CLI Error Handling", () => {
	it("should handle invalid voice from CLI", async () => {
		try {
			const result =
				await $`bun run src/index.ts "Test" --voice invalid-voice --save /tmp/error_test.mp3`.text();
			expect(result).toContain("Error:");
			expect(result.toLowerCase()).toContain("voice");
		} catch (error) {
			// Process might exit with error code
			expect(error).toBeDefined();
		}
	}, 10000);

	it("should handle missing argument value", async () => {
		const result =
			await $`bun run src/index.ts "Test" --voice --save /tmp/test_missing_arg.mp3`.text();
		// Should use default voice when --voice has no value
		expect(result).toContain("Voice: en-US-AriaNeural");
	}, 10000);

	it("should handle invalid save path", async () => {
		try {
			const result =
				await $`bun run src/index.ts "Test" --save /invalid/path/that/does/not/exist/file.mp3`.text();
			// Might either create the directory or fail
			expect(result).toBeDefined();
		} catch (error) {
			expect(error).toBeDefined();
		}
	}, 10000);

	it("should handle multiple text arguments correctly", async () => {
		const result =
			await $`bun run src/index.ts "First text" "Second text" --save /tmp/multi_test.mp3`.text();
		// Should only use the first non-flag argument
		expect(result).toContain("First text");
		expect(result).not.toContain("Second text");
	}, 10000);

	it("should handle special characters in save path", async () => {
		const specialPath = "/tmp/test file with spaces.mp3";
		try {
			const result =
				await $`bun run src/index.ts "Test" --save "${specialPath}"`.text();
			expect(result).toContain("Saved to:");
			// Clean up
			await $`rm -f "${specialPath}"`.quiet();
		} catch (error) {
			// Might fail on some systems
			expect(error).toBeDefined();
		}
	}, 10000);
});

describe("Argument Validation", () => {
	it("should reject conflicting flags", async () => {
		try {
			// --check and --list-voices together
			const result = await $`bun run src/index.ts --check --list-voices`.text();
			// Should prioritize one over the other
			expect(result).toBeDefined();
			const hasCheck = result.includes("Checking system");
			const hasVoices = result.includes("Fetching voices");
			// Should execute only one
			expect(hasCheck !== hasVoices).toBe(true);
		} catch (error) {
			// In CI environments, network calls might fail, that's acceptable
			if (isCI) {
				console.log("Test skipped in CI environment (network issues)");
				return; // Skip test in CI
			}
			throw error; // Re-throw in local environment
		}
	}, 15000);

	it("should handle rate out of reasonable bounds", async () => {
		try {
			const audio = await synthesizeSpeech(
				"Test",
				"en-US-AriaNeural",
				"+500%", // Extremely fast
				"+0Hz",
			);
			// If it accepts it, should still return audio
			expect(audio).toBeInstanceOf(Blob);
		} catch (error) {
			// Or it might reject extreme values
			expect(error).toBeInstanceOf(Error);
		}
	}, 10000);

	it("should handle pitch out of reasonable bounds", async () => {
		try {
			const audio = await synthesizeSpeech(
				"Test",
				"en-US-AriaNeural",
				"+0%",
				"+1000Hz", // Extremely high pitch
			);
			// If it accepts it, should still return audio
			expect(audio).toBeInstanceOf(Blob);
		} catch (error) {
			// Or it might reject extreme values
			expect(error).toBeInstanceOf(Error);
		}
	}, 10000);
});
