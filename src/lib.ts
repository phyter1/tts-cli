import { $ } from "bun";
import {
	EdgeTTS,
	listVoices as listVoicesUniversal,
	type Voice,
} from "edge-tts-universal";
import { getCachedAudio, saveToCache } from "./cache";

export interface CLIArgs {
	text?: string;
	voice: string;
	outputFile?: string;
	shouldCheck: boolean;
	shouldListVoices: boolean;
	shouldShowVersion: boolean;
	rate: string;
	pitch: string;
	showHelp: boolean;
	noCache: boolean;
	clearCache: boolean;
	cacheStats: boolean;
}

export function parseArgs(args: string[]): CLIArgs {
	const text = args.find((a) => !a.startsWith("--"));
	const getArg = (name: string) => {
		const idx = args.indexOf(`--${name}`);
		if (idx >= 0 && idx + 1 < args.length) {
			const nextArg = args[idx + 1];
			// Don't return the next arg if it's another flag
			if (nextArg && !nextArg.startsWith("--")) {
				return nextArg;
			}
		}
		return undefined;
	};

	return {
		text,
		voice: getArg("voice") || "en-US-AriaNeural",
		outputFile: getArg("save") || getArg("output"),
		shouldCheck: args.includes("--check"),
		shouldListVoices: args.includes("--list-voices"),
		shouldShowVersion: args.includes("--version") || args.includes("-v"),
		rate: getArg("rate") || "+0%",
		pitch: getArg("pitch") || "+0Hz",
		noCache: args.includes("--no-cache"),
		clearCache: args.includes("--clear-cache"),
		cacheStats: args.includes("--cache-stats"),
		showHelp:
			args.includes("--help") ||
			(!text &&
				!args.includes("--check") &&
				!args.includes("--list-voices") &&
				!args.includes("--version") &&
				!args.includes("-v") &&
				!args.includes("--clear-cache") &&
				!args.includes("--cache-stats")),
	};
}

export function getHelpText(): string {
	const homeDir = process.env.HOME || process.env.USERPROFILE || "~";
	const cacheLocation = `${homeDir}/.cache/tts-cli/`;

	return `
🎙️  Bun-Native TTS (using Bun's $ utility)

Usage:
  bun tts-bun.ts "text" [options]

Options:
  --voice NAME     Voice to use (default: en-US-AriaNeural)
  --rate RATE      Speech rate (e.g., +20%, -10%)
  --pitch PITCH    Voice pitch (e.g., +10Hz, -20Hz)
  --save FILE      Save to file instead of playing
  --check          Check system setup
  --list-voices    List all available voices
  --no-cache       Bypass cache for fresh synthesis
  --clear-cache    Clear all cached audio files
  --cache-stats    Display cache statistics

Cache:
  Location: ${cacheLocation}
  Cached audio files are stored using SHA-256 hashes of text+voice+settings

Examples:
  bun tts-bun.ts "Hello world"
  bun tts-bun.ts "Hello" --voice en-GB-SoniaNeural
  bun tts-bun.ts "Fast" --rate +30% --pitch +10Hz
  bun tts-bun.ts "Save me" --save output.mp3
  bun tts-bun.ts "Hello" --no-cache
  bun tts-bun.ts --cache-stats
`;
}

export async function checkSystem(): Promise<string[]> {
	const results: string[] = [];

	// Check Bun version
	try {
		const bunVersion = await $`bun --version`.text();
		results.push(`✅ Bun: ${bunVersion.trim()}`);
	} catch {
		results.push("❌ Bun not found");
	}

	// Check for audio players
	if (process.platform === "darwin") {
		try {
			await $`which afplay`.quiet();
			results.push("✅ afplay (macOS built-in)");
		} catch {
			results.push("❌ afplay not found");
		}
	} else if (process.platform === "win32") {
		results.push("✅ PowerShell (Windows built-in)");
	} else {
		// Linux - check multiple players
		const players = ["ffplay", "aplay", "mpg123", "play"];
		for (const player of players) {
			try {
				await $`which ${player}`.quiet();
				results.push(`✅ ${player}`);
			} catch {
				results.push(`❌ ${player} not found`);
			}
		}
	}

	// Check internet connectivity
	try {
		await $`ping -c 1 speech.platform.bing.com`.quiet();
		results.push("✅ Can reach Microsoft TTS servers");
	} catch {
		results.push("⚠️  Cannot ping TTS servers (might still work)");
	}

	// Check disk space for temp files
	const tempDir = "/tmp";
	try {
		const dfOutput = await $`df -h ${tempDir}`.text();
		const lines = dfOutput.split("\n");
		if (lines[1]) {
			const parts = lines[1].split(/\s+/);
			results.push(`✅ ${tempDir} - ${parts[3]} available`);
		}
	} catch {
		results.push(`✅ ${tempDir} exists`);
	}

	return results;
}

export async function listVoices(): Promise<Voice[]> {
	return await listVoicesUniversal();
}

export function formatVoices(voices: Voice[]): string[] {
	const grouped = voices.reduce(
		(acc, voice) => {
			const lang = (voice.Locale ?? "").split("-")[0] || "unknown";
			if (!acc[lang]) acc[lang] = [];
			acc[lang].push(voice);
			return acc;
		},
		{} as Record<string, Voice[]>,
	);

	const output: string[] = [];
	Object.entries(grouped).forEach(([lang, voiceList]) => {
		output.push(`[${lang.toUpperCase()}] ${voiceList.length} voices`);
		voiceList.slice(0, 5).forEach((v) => {
			output.push(`  ${v.ShortName.padEnd(25)} (${v.Gender})`);
		});
		if (voiceList.length > 5) {
			output.push(`  ... and ${voiceList.length - 5} more`);
		}
	});
	output.push(`Total: ${voices.length} voices available`);
	return output;
}

export function getAudioCommands(platform: string, file: string): string[] {
	const commands = {
		darwin: [`afplay ${file}`],
		win32: [
			`powershell -c "(New-Object Media.SoundPlayer '${file}').PlaySync()"`,
		],
		linux: [
			`ffplay -nodisp -autoexit -loglevel quiet ${file}`,
			`aplay ${file}`,
			`mpg123 -q ${file}`,
			`play ${file}`,
		],
	};

	return commands[platform as keyof typeof commands] || commands.linux;
}

export async function playAudio(file: string): Promise<boolean> {
	const platformCommands = getAudioCommands(process.platform, file);

	for (const cmd of platformCommands) {
		try {
			await $`sh -c ${cmd}`.quiet();
			return true;
		} catch {}
	}
	return false;
}

export async function synthesizeSpeech(
	text: string,
	voice: string,
	rate: string,
	pitch: string,
	useCache = true,
): Promise<Blob> {
	// Handle extremely long text by truncating or splitting
	const MAX_TEXT_LENGTH = 10000; // Microsoft TTS has practical limits

	if (text.length === 0) {
		// Handle empty text
		text = " "; // Use single space for empty text to avoid TTS errors
	}

	if (text.length > MAX_TEXT_LENGTH) {
		// For extremely long text, truncate to prevent timeouts
		text = text.substring(0, MAX_TEXT_LENGTH);
		console.warn(
			`Text truncated to ${MAX_TEXT_LENGTH} characters to prevent timeout`,
		);
	}

	// Check cache first if enabled
	if (useCache) {
		const cachedAudio = await getCachedAudio(text, voice, rate, pitch);
		if (cachedAudio) {
			console.log("🎯 Using cached audio");
			return cachedAudio;
		}
	}

	try {
		const tts = new EdgeTTS(text, voice, { rate, pitch });
		const result = await tts.synthesize();
		const audioBlob = result.audio;

		// Save to cache if enabled
		if (useCache) {
			await saveToCache(text, voice, rate, pitch, audioBlob);
			console.log("💾 Saved to cache");
		}

		return audioBlob;
	} catch (error) {
		// Handle TTS errors gracefully
		if (error instanceof Error) {
			throw new Error(`TTS synthesis failed: ${error.message}`);
		}
		throw new Error("TTS synthesis failed with unknown error");
	}
}

export function formatText(text: string, maxLength = 50): string {
	return `${text.substring(0, maxLength)}${text.length > maxLength ? "..." : ""}`;
}
