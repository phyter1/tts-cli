import { afterEach, describe, expect, it } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { $ } from "bun";
import { synthesizeSpeech } from "../src/lib";

describe("TTS Integration Tests", () => {
	const testFile = "/tmp/test_tts_output.mp3";

	afterEach(() => {
		// Cleanup test files
		if (existsSync(testFile)) {
			rmSync(testFile);
		}
	});

	it("should synthesize speech with default settings", async () => {
		const audio = await synthesizeSpeech(
			"Hello world",
			"en-US-AriaNeural",
			"+0%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
		expect(audio.type).toBe("audio/mpeg");
	}, 10000);

	it("should synthesize speech with custom rate", async () => {
		const audio = await synthesizeSpeech(
			"Testing speed",
			"en-US-AriaNeural",
			"+50%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
	}, 10000);

	it("should synthesize speech with custom pitch", async () => {
		const audio = await synthesizeSpeech(
			"Testing pitch",
			"en-US-AriaNeural",
			"+0%",
			"+20Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
	}, 10000);

	it("should synthesize speech with different voice", async () => {
		const audio = await synthesizeSpeech(
			"Different voice",
			"en-GB-SoniaNeural",
			"+0%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
	}, 10000);

	it("should handle long text", async () => {
		const longText =
			"This is a longer piece of text that should be synthesized. ".repeat(5);
		const audio = await synthesizeSpeech(
			longText,
			"en-US-AriaNeural",
			"+0%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(10000); // Expect larger file for longer text
	}, 15000);

	it("should save audio to file", async () => {
		const audio = await synthesizeSpeech(
			"Save test",
			"en-US-AriaNeural",
			"+0%",
			"+0Hz",
		);
		await Bun.write(testFile, await audio.arrayBuffer());
		expect(existsSync(testFile)).toBe(true);

		// Verify file size
		const file = Bun.file(testFile);
		expect(file.size).toBeGreaterThan(0);
	}, 10000);

	it("should handle special characters in text", async () => {
		const audio = await synthesizeSpeech(
			"Hello! How are you? I'm fine, thanks.",
			"en-US-AriaNeural",
			"+0%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
	}, 10000);

	it("should handle numbers in text", async () => {
		const audio = await synthesizeSpeech(
			"The year is 2024 and the temperature is 25 degrees.",
			"en-US-AriaNeural",
			"+0%",
			"+0Hz",
		);
		expect(audio).toBeInstanceOf(Blob);
		expect(audio.size).toBeGreaterThan(0);
	}, 10000);
});

describe("CLI Integration Tests", () => {
	it("should show help when no arguments provided", async () => {
		const result = await $`bun run src/index.ts`.text();
		expect(result).toContain("Usage:");
		expect(result).toContain("Options:");
	});

	it("should handle --help flag", async () => {
		const result = await $`bun run src/index.ts --help`.text();
		expect(result).toContain("Usage:");
		expect(result).toContain("Examples:");
	});

	it("should handle --check flag", async () => {
		const result = await $`bun run src/index.ts --check`.text();
		expect(result).toContain("Checking system setup");
		expect(result).toContain("Bun:");
		expect(result).toContain("System check complete");
	});

	it("should handle --list-voices flag", async () => {
		const result = await $`bun run src/index.ts --list-voices`.text();
		expect(result).toContain("Fetching voices");
		expect(result).toContain("voices");
	}, 10000);

	it("should synthesize speech from command line", async () => {
		const outputFile = "/tmp/cli_test_output.mp3";
		try {
			const result =
				await $`bun run src/index.ts "Hello from CLI" --save ${outputFile}`.text();
			expect(result).toContain("Converting:");
			expect(result).toContain("Generated");
			expect(result).toContain("Saved to:");
			expect(existsSync(outputFile)).toBe(true);
		} finally {
			if (existsSync(outputFile)) {
				rmSync(outputFile);
			}
		}
	}, 10000);

	it("should handle custom voice from command line", async () => {
		const outputFile = "/tmp/cli_voice_test.mp3";
		try {
			const result =
				await $`bun run src/index.ts "Test voice" --voice en-GB-SoniaNeural --save ${outputFile}`.text();
			expect(result).toContain("Voice: en-GB-SoniaNeural");
			expect(existsSync(outputFile)).toBe(true);
		} finally {
			if (existsSync(outputFile)) {
				rmSync(outputFile);
			}
		}
	}, 10000);

	it("should handle rate and pitch options", async () => {
		const outputFile = "/tmp/cli_rate_pitch_test.mp3";
		try {
			const result =
				await $`bun run src/index.ts "Test rate and pitch" --rate +30% --pitch +10Hz --save ${outputFile}`.text();
			expect(result).toContain("Rate: +30%");
			expect(result).toContain("Pitch: +10Hz");
			expect(existsSync(outputFile)).toBe(true);
		} finally {
			if (existsSync(outputFile)) {
				rmSync(outputFile);
			}
		}
	}, 10000);
});
