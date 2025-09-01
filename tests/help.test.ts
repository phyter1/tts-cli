import { describe, expect, it } from "bun:test";
import { getHelpText } from "../src/lib";

describe("getHelpText", () => {
	it("should return help text", () => {
		const helpText = getHelpText();
		expect(helpText).toBeString();
		expect(helpText.length).toBeGreaterThan(0);
	});

	it("should include usage information", () => {
		const helpText = getHelpText();
		expect(helpText).toContain("Usage:");
		expect(helpText).toContain('bun tts-bun.ts "text" [options]');
	});

	it("should include all options", () => {
		const helpText = getHelpText();
		expect(helpText).toContain("--voice");
		expect(helpText).toContain("--rate");
		expect(helpText).toContain("--pitch");
		expect(helpText).toContain("--save");
		expect(helpText).toContain("--check");
		expect(helpText).toContain("--list-voices");
	});

	it("should include examples", () => {
		const helpText = getHelpText();
		expect(helpText).toContain("Examples:");
		expect(helpText).toContain('"Hello world"');
		expect(helpText).toContain("en-GB-SoniaNeural");
		expect(helpText).toContain("+30%");
		expect(helpText).toContain("output.mp3");
	});

	it("should include default values", () => {
		const helpText = getHelpText();
		expect(helpText).toContain("default: en-US-AriaNeural");
	});

	it("should describe rate and pitch formats", () => {
		const helpText = getHelpText();
		expect(helpText).toContain("+20%, -10%");
		expect(helpText).toContain("+10Hz, -20Hz");
	});
});