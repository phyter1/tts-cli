import { describe, expect, it } from "bun:test";
import { parseArgs } from "../src/lib";

describe("parseArgs", () => {
	it("should parse text argument", () => {
		const args = parseArgs(["Hello world"]);
		expect(args.text).toBe("Hello world");
	});

	it("should ignore text that starts with --", () => {
		const args = parseArgs(["--help"]);
		expect(args.text).toBeUndefined();
	});

	it("should use default voice when not specified", () => {
		const args = parseArgs(["Hello"]);
		expect(args.voice).toBe("en-US-AriaNeural");
	});

	it("should parse voice argument", () => {
		const args = parseArgs(["Hello", "--voice", "en-GB-SoniaNeural"]);
		expect(args.voice).toBe("en-GB-SoniaNeural");
	});

	it("should parse save argument", () => {
		const args = parseArgs(["Hello", "--save", "output.mp3"]);
		expect(args.outputFile).toBe("output.mp3");
	});

	it("should parse output argument", () => {
		const args = parseArgs(["Hello", "--output", "file.mp3"]);
		expect(args.outputFile).toBe("file.mp3");
	});

	it("should parse check flag", () => {
		const args = parseArgs(["--check"]);
		expect(args.shouldCheck).toBe(true);
	});

	it("should parse list-voices flag", () => {
		const args = parseArgs(["--list-voices"]);
		expect(args.shouldListVoices).toBe(true);
	});

	it("should use default rate when not specified", () => {
		const args = parseArgs(["Hello"]);
		expect(args.rate).toBe("+0%");
	});

	it("should parse rate argument", () => {
		const args = parseArgs(["Hello", "--rate", "+20%"]);
		expect(args.rate).toBe("+20%");
	});

	it("should use default pitch when not specified", () => {
		const args = parseArgs(["Hello"]);
		expect(args.pitch).toBe("+0Hz");
	});

	it("should parse pitch argument", () => {
		const args = parseArgs(["Hello", "--pitch", "+10Hz"]);
		expect(args.pitch).toBe("+10Hz");
	});

	it("should parse help flag", () => {
		const args = parseArgs(["--help"]);
		expect(args.showHelp).toBe(true);
	});

	it("should show help when no arguments provided", () => {
		const args = parseArgs([]);
		expect(args.showHelp).toBe(true);
	});

	it("should not show help when check flag is provided", () => {
		const args = parseArgs(["--check"]);
		expect(args.showHelp).toBe(false);
	});

	it("should not show help when list-voices flag is provided", () => {
		const args = parseArgs(["--list-voices"]);
		expect(args.showHelp).toBe(false);
	});

	it("should parse multiple arguments correctly", () => {
		const args = parseArgs([
			"Test text",
			"--voice",
			"custom-voice",
			"--rate",
			"+50%",
			"--pitch",
			"-10Hz",
			"--save",
			"test.mp3",
		]);
		expect(args.text).toBe("Test text");
		expect(args.voice).toBe("custom-voice");
		expect(args.rate).toBe("+50%");
		expect(args.pitch).toBe("-10Hz");
		expect(args.outputFile).toBe("test.mp3");
		expect(args.showHelp).toBe(false);
	});

	it("should handle missing values for arguments gracefully", () => {
		const args = parseArgs(["Hello", "--voice"]);
		expect(args.text).toBe("Hello");
		// When --voice has no value, it returns default
		expect(args.voice).toBe("en-US-AriaNeural");
	});

	it("should prefer save over output when both are provided", () => {
		const args = parseArgs([
			"Hello",
			"--save",
			"save.mp3",
			"--output",
			"output.mp3",
		]);
		expect(args.outputFile).toBe("save.mp3");
	});
});
