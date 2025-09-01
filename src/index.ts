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
	checkSystem as checkSystemLib,
	formatText,
	formatVoices,
	getHelpText,
	listVoices as listVoicesLib,
	parseArgs,
	playAudio,
	synthesizeSpeech,
} from "./lib";

// Parse arguments
const args = parseArgs(Bun.argv.slice(2));

// Help function
async function showHelp() {
	console.log(getHelpText());
}

// Check system setup
async function checkSystem() {
	console.log("🔍 Checking system setup...\n");
	const results = await checkSystemLib();
	for (const result of results) {
		console.log(result);
	}
	console.log("\n✨ System check complete!");
}

// List voices with better formatting
async function listVoices() {
	console.log("📋 Fetching voices...\n");

	try {
		const voiceList = await listVoicesLib();
		const formatted = formatVoices(voiceList);
		for (const line of formatted) {
			console.log(line);
		}
		console.log("\n✨ Done!");
	} catch {
		console.error("Failed to fetch voices");
	}
}

// Show version
async function showVersion() {
	const version = "1.0.0"; // This could be read from package.json or version.txt
	console.log(`tts-cli version ${version}`);
}

// Main execution
async function main() {
	// Handle special commands
	if (args.shouldShowVersion) {
		await showVersion();
		return;
	}

	if (args.shouldCheck) {
		await checkSystem();
		return;
	}

	if (args.shouldListVoices) {
		await listVoices();
		return;
	}

	if (args.showHelp) {
		await showHelp();
		return;
	}

	if (!args.text) {
		await showHelp();
		return;
	}

	// Synthesize speech
	console.log(`🎙️  Converting: "${formatText(args.text)}"`);
	console.log(`   Voice: ${args.voice}`);
	if (args.rate !== "+0%") console.log(`   Rate: ${args.rate}`);
	if (args.pitch !== "+0Hz") console.log(`   Pitch: ${args.pitch}`);

	try {
		const audio = await synthesizeSpeech(
			args.text,
			args.voice,
			args.rate,
			args.pitch,
		);

		// Save audio
		const file = args.outputFile || `/tmp/tts_${Date.now()}.mp3`;
		await Bun.write(file, await audio.arrayBuffer());

		console.log(`✅ Generated ${(audio.size / 1024).toFixed(1)} KB`);

		if (args.outputFile) {
			console.log(`💾 Saved to: ${args.outputFile}`);
		} else {
			console.log("🔊 Playing...");
			const played = await playAudio(file);
			if (!played) {
				console.log(`⚠️  No audio player worked. File saved: ${file}`);
			}

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
