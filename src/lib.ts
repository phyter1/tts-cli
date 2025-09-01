import { $ } from "bun";
import {
	EdgeTTS,
	listVoices as listVoicesUniversal,
	type Voice,
} from "edge-tts-universal";

export interface CLIArgs {
	text?: string;
	voice: string;
	outputFile?: string;
	shouldCheck: boolean;
	shouldListVoices: boolean;
	rate: string;
	pitch: string;
	showHelp: boolean;
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
		rate: getArg("rate") || "+0%",
		pitch: getArg("pitch") || "+0Hz",
		showHelp:
			args.includes("--help") ||
			(!text && !args.includes("--check") && !args.includes("--list-voices")),
	};
}

export function getHelpText(): string {
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

Examples:
  bun tts-bun.ts "Hello world"
  bun tts-bun.ts "Hello" --voice en-GB-SoniaNeural
  bun tts-bun.ts "Fast" --rate +30% --pitch +10Hz
  bun tts-bun.ts "Save me" --save output.mp3
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
): Promise<Blob> {
	const tts = new EdgeTTS(text, voice, { rate, pitch });
	const result = await tts.synthesize();
	return result.audio;
}

export function formatText(text: string, maxLength = 50): string {
	return `${text.substring(0, maxLength)}${text.length > maxLength ? "..." : ""}`;
}
