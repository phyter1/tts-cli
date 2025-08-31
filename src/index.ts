#!/usr/bin/env bun

/**
 * Bun-Native TTS Script
 * Showcases Bun's $ utility for shell operations
 *
 * Usage:
 *   bun tts-bun.ts "Hello world"
 *   bun tts-bun.ts "Hello" --voice en-GB-SoniaNeural --save output.mp3
 *   bun tts-bun.ts --check    # Check system setup
 */

import { $ } from "bun";
import {
	EdgeTTS,
	listVoices as listVoicesUniversal,
	type Voice,
} from "edge-tts-universal";

// Parse arguments with destructuring
const args = Bun.argv.slice(2);
const text = args.find((a) => !a.startsWith("--"));
const getArg = (name: string) => {
	const idx = args.indexOf(`--${name}`);
	return idx >= 0 ? args[idx + 1] : undefined;
};

const voice = getArg("voice") || "en-US-AriaNeural";
const outputFile = getArg("save") || getArg("output");
const shouldCheck = args.includes("--check");
const shouldListVoices = args.includes("--list-voices");
const rate = getArg("rate") || "+0%";
const pitch = getArg("pitch") || "+0Hz";

// Help function
async function showHelp() {
	console.log(`
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
`);
}

// Check system setup using Bun's $
async function checkSystem() {
	console.log("🔍 Checking system setup...\n");

	// Check Bun version
	const bunVersion = await $`bun --version`.text();
	console.log(`✅ Bun: ${bunVersion.trim()}`);

	// Check for audio players
	console.log("\n🔊 Audio players:");

	if (process.platform === "darwin") {
		try {
			await $`which afplay`.quiet();
			console.log("✅ afplay (macOS built-in)");
		} catch {
			console.log("❌ afplay not found");
		}
	} else if (process.platform === "win32") {
		console.log("✅ PowerShell (Windows built-in)");
	} else {
		// Linux - check multiple players
		const players = ["ffplay", "aplay", "mpg123", "play"];
		for (const player of players) {
			try {
				await $`which ${player}`.quiet();
				console.log(`✅ ${player}`);
			} catch {
				console.log(`❌ ${player} not found`);
			}
		}
	}

	// Check internet connectivity
	console.log("\n🌐 Internet connection:");
	try {
		await $`ping -c 1 speech.platform.bing.com`.quiet();
		console.log("✅ Can reach Microsoft TTS servers");
	} catch {
		console.log("⚠️  Cannot ping TTS servers (might still work)");
	}

	// Check disk space for temp files
	console.log("\n💾 Temp directory:");
	const tempDir = "/tmp";
	try {
		const dfOutput = await $`df -h ${tempDir}`.text();
		const lines = dfOutput.split("\n");
		if (lines[1]) {
			const parts = lines[1].split(/\s+/);
			console.log(`✅ ${tempDir} - ${parts[3]} available`);
		}
	} catch {
		console.log(`✅ ${tempDir} exists`);
	}

	console.log("\n✨ System check complete!");
}

// List voices with better formatting
async function listVoices() {
	console.log("📋 Fetching voices...\n");

	try {
		const voiceList = await listVoicesUniversal();

		// Group by language
		const grouped = voiceList.reduce(
			(acc, voice) => {
				const lang = (voice.Locale ?? "").split("-")[0] || "unknown";
				if (!acc[lang]) acc[lang] = [];
				acc[lang].push(voice);
				return acc;
			},
			{} as Record<string, Voice[]>,
		);

		// Display grouped voices
		Object.entries(grouped).forEach(([lang, voices]) => {
			console.log(`\n[${lang.toUpperCase()}] ${voices.length} voices`);
			voices.slice(0, 5).forEach((v) => {
				console.log(`  ${v.ShortName.padEnd(25)} (${v.Gender})`);
			});
			if (voices.length > 5) {
				console.log(`  ... and ${voices.length - 5} more`);
			}
		});

		console.log(`\n✨ Total: ${voiceList.length} voices available`);
	} catch {
		console.error("Failed to fetch voices");
	}
}

// Play audio using Bun's $ with automatic fallback
async function playAudio(file: string) {
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

	const platformCommands =
		commands[process.platform as keyof typeof commands] || commands.linux;

	for (const cmd of platformCommands) {
		try {
			await $`sh -c ${cmd}`.quiet();
			return; // Success, exit
		} catch {}
	}

	console.log(`⚠️  No audio player worked. File saved: ${file}`);
}

// Main execution
async function main() {
	// Handle special commands
	if (shouldCheck) {
		await checkSystem();
		return;
	}

	if (shouldListVoices) {
		await listVoices();
		return;
	}

	if (!text || args.includes("--help")) {
		await showHelp();
		return;
	}

	// Synthesize speech
	console.log(
		`🎙️  Converting: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
	);
	console.log(`   Voice: ${voice}`);
	if (rate !== "+0%") console.log(`   Rate: ${rate}`);
	if (pitch !== "+0Hz") console.log(`   Pitch: ${pitch}`);

	try {
		const tts = new EdgeTTS(text, voice, { rate, pitch });
		const result = await tts.synthesize();

		// Save audio
		const file = outputFile || `/tmp/tts_${Date.now()}.mp3`;
		await Bun.write(file, await result.audio.arrayBuffer());

		console.log(`✅ Generated ${(result.audio.size / 1024).toFixed(1)} KB`);

		if (outputFile) {
			console.log(`💾 Saved to: ${outputFile}`);
		} else {
			console.log("🔊 Playing...");
			await playAudio(file);

			// Cleanup temp file
			await $`rm -f ${file}`.quiet();
			console.log("✨ Done!");
		}
	} catch (error: unknown) {
		console.error(
			`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
		);

		// Helpful error messages
		if (error instanceof Error && error.message?.includes("voice")) {
			console.log("\n💡 Try: bun tts-bun.ts --list-voices");
		} else if (error instanceof Error && error.message?.includes("network")) {
			console.log("\n💡 Check internet connection");
		}
	}
}

// Run
main().catch(console.error);
