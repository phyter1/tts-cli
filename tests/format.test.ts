import { describe, expect, it } from "bun:test";
import { formatText, formatVoices } from "../src/lib";

describe("formatText", () => {
	it("should return text as-is when shorter than max length", () => {
		const result = formatText("Hello world", 50);
		expect(result).toBe("Hello world");
	});

	it("should truncate and add ellipsis when text exceeds max length", () => {
		const longText = "This is a very long text that should be truncated";
		const result = formatText(longText, 20);
		expect(result).toBe("This is a very long ...");
	});

	it("should use default max length of 50", () => {
		const longText = "a".repeat(60);
		const result = formatText(longText);
		expect(result).toBe(`${"a".repeat(50)}...`);
	});

	it("should handle empty string", () => {
		const result = formatText("", 50);
		expect(result).toBe("");
	});

	it("should handle exact length match", () => {
		const text = "12345";
		const result = formatText(text, 5);
		expect(result).toBe("12345");
	});
});

describe("formatVoices", () => {
	const mockVoices = [
		{
			Name: "Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)",
			ShortName: "en-US-AriaNeural",
			Gender: "Female" as "Female",
			Locale: "en-US",
			LocaleName: "English (United States)",
			FriendlyName: "Microsoft Aria Online (Natural) - English (United States)",
			Status: "GA" as "GA",
			SuggestedCodec:
				"audio-24khz-48kbitrate-mono-mp3" as "audio-24khz-48kbitrate-mono-mp3",
			VoiceTag: {
				ContentCategories: ["General" as const],
				VoicePersonalities: ["Friendly" as const],
			},
		},
		{
			Name: "Microsoft Server Speech Text to Speech Voice (en-GB, SoniaNeural)",
			ShortName: "en-GB-SoniaNeural",
			Gender: "Female" as "Female",
			Locale: "en-GB",
			LocaleName: "English (United Kingdom)",
			FriendlyName:
				"Microsoft Sonia Online (Natural) - English (United Kingdom)",
			Status: "GA" as "GA",
			SuggestedCodec:
				"audio-24khz-48kbitrate-mono-mp3" as "audio-24khz-48kbitrate-mono-mp3",
			VoiceTag: {
				ContentCategories: ["General" as const],
				VoicePersonalities: ["Friendly" as const],
			},
		},
		{
			Name: "Microsoft Server Speech Text to Speech Voice (fr-FR, DeniseNeural)",
			ShortName: "fr-FR-DeniseNeural",
			Gender: "Female" as "Female",
			Locale: "fr-FR",
			LocaleName: "French (France)",
			FriendlyName: "Microsoft Denise Online (Natural) - French (France)",
			Status: "GA" as "GA",
			SuggestedCodec:
				"audio-24khz-48kbitrate-mono-mp3" as "audio-24khz-48kbitrate-mono-mp3",
			VoiceTag: {
				ContentCategories: ["General" as const],
				VoicePersonalities: ["Friendly" as const],
			},
		},
	];

	it("should group voices by language", () => {
		const result = formatVoices(mockVoices);
		expect(result).toContain("[EN] 2 voices");
		expect(result).toContain("[FR] 1 voices");
	});

	it("should format voice details correctly", () => {
		const result = formatVoices(mockVoices);
		const voiceLines = result.filter((line) => line.startsWith("  "));
		expect(voiceLines.some((line) => line.includes("en-US-AriaNeural"))).toBe(
			true,
		);
		expect(voiceLines.some((line) => line.includes("(Female)"))).toBe(true);
	});

	it("should include total count", () => {
		const result = formatVoices(mockVoices);
		expect(result[result.length - 1]).toBe("Total: 3 voices available");
	});

	it("should handle empty voice list", () => {
		const result = formatVoices([]);
		expect(result[result.length - 1]).toBe("Total: 0 voices available");
	});

	it("should handle voices without locale", () => {
		const voicesWithoutLocale = [
			{
				Name: "Microsoft Server Speech Text to Speech Voice (test-voice)",
				ShortName: "test-voice",
				Gender: "Male" as "Male",
				Locale: "",
				LocaleName: "Test",
				FriendlyName: "Test Voice",
				Status: "GA" as "GA",
				SuggestedCodec:
					"audio-24khz-48kbitrate-mono-mp3" as "audio-24khz-48kbitrate-mono-mp3",
				VoiceTag: {
					ContentCategories: ["General" as const],
					VoicePersonalities: ["Friendly" as const],
				},
			},
		];
		const result = formatVoices(voicesWithoutLocale);
		expect(result).toContain("[UNKNOWN] 1 voices");
	});

	it("should limit displayed voices to 5 per language", () => {
		const manyVoices = Array.from({ length: 10 }, (_, i) => ({
			Name: `Microsoft Server Speech Text to Speech Voice (en-US, Voice${i})`,
			ShortName: `en-US-Voice${i}`,
			Gender: "Female" as "Female",
			Locale: "en-US",
			LocaleName: "English (United States)",
			FriendlyName: `Voice ${i}`,
			Status: "GA" as "GA",
			SuggestedCodec:
				"audio-24khz-48kbitrate-mono-mp3" as "audio-24khz-48kbitrate-mono-mp3",
			VoiceTag: {
				ContentCategories: ["General" as const],
				VoicePersonalities: ["Friendly" as const],
			},
		}));
		const result = formatVoices(manyVoices);
		const voiceLines = result.filter(
			(line) => line.startsWith("  ") && !line.includes("..."),
		);
		expect(voiceLines.length).toBe(5);
		expect(result.some((line) => line.includes("... and 5 more"))).toBe(true);
	});
});
