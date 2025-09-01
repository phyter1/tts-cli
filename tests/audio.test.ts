import { describe, expect, it } from "bun:test";
import { getAudioCommands, playAudio } from "../src/lib";

describe("getAudioCommands", () => {
	it("should return afplay command for macOS", () => {
		const commands = getAudioCommands("darwin", "/tmp/test.mp3");
		expect(commands).toEqual(["afplay /tmp/test.mp3"]);
	});

	it("should return PowerShell command for Windows", () => {
		const commands = getAudioCommands("win32", "/tmp/test.mp3");
		expect(commands).toEqual([
			`powershell -c "(New-Object Media.SoundPlayer '/tmp/test.mp3').PlaySync()"`,
		]);
	});

	it("should return multiple Linux commands", () => {
		const commands = getAudioCommands("linux", "/tmp/test.mp3");
		expect(commands).toContain(
			"ffplay -nodisp -autoexit -loglevel quiet /tmp/test.mp3",
		);
		expect(commands).toContain("aplay /tmp/test.mp3");
		expect(commands).toContain("mpg123 -q /tmp/test.mp3");
		expect(commands).toContain("play /tmp/test.mp3");
	});

	it("should default to Linux commands for unknown platform", () => {
		const commands = getAudioCommands("freebsd", "/tmp/test.mp3");
		expect(commands).toContain(
			"ffplay -nodisp -autoexit -loglevel quiet /tmp/test.mp3",
		);
	});

	it("should handle file paths with spaces", () => {
		const commands = getAudioCommands("darwin", "/tmp/test file.mp3");
		expect(commands).toEqual(["afplay /tmp/test file.mp3"]);
	});

	it("should handle absolute Windows paths", () => {
		const commands = getAudioCommands("win32", "C:\\temp\\test.mp3");
		expect(commands).toEqual([
			`powershell -c "(New-Object Media.SoundPlayer 'C:\\temp\\test.mp3').PlaySync()"`,
		]);
	});
});

describe("playAudio", () => {
	it("should return false for non-existent file", async () => {
		const result = await playAudio("/tmp/non-existent-file.mp3");
		expect(result).toBe(false);
	}, 10000);

	// Note: We can't test successful audio playback in CI without actual audio files
	// and without disrupting the test environment, but the function is covered
	// by testing the failure case when all commands fail
});
