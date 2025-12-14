#!/usr/bin/env node
import { spawn } from "child_process";
import { setTimeout } from "timers/promises";

const DEV_SERVER_URL = "http://localhost:5173";
const WAIT_TIME = 5000; // Wait 5 seconds for dev server to start

async function waitForServer(maxAttempts = 30) {
	for (let i = 0; i < maxAttempts; i++) {
		try {
			const response = await fetch(DEV_SERVER_URL);
			if (response.ok) {
				console.log("✓ Dev server is ready");
				return true;
			}
		} catch {
			// Server not ready yet
		}
		await setTimeout(1000);
		process.stdout.write(".");
	}
	return false;
}

async function main() {
	console.log("Starting dev server...");
	const devServer = spawn("npm", ["run", "dev"], {
		stdio: ["ignore", "pipe", "pipe"],
		shell: true,
	});

	// Log dev server output
	devServer.stdout.on("data", (data) => {
		const output = data.toString();
		if (output.includes("Local:") || output.includes("localhost")) {
			process.stdout.write(output);
		}
	});
	devServer.stderr.on("data", (data) => {
		process.stderr.write(data);
	});

	try {
		console.log(`Waiting for dev server at ${DEV_SERVER_URL}...`);
		const serverReady = await waitForServer();

		if (!serverReady) {
			console.error("\n✗ Dev server failed to start in time");
			devServer.kill();
			process.exit(1);
		}

		console.log("\nGenerating images...");
		const generateProcess = spawn("bun", ["scripts/generate-cards.js"], {
			stdio: "inherit",
			shell: true,
		});

		await new Promise((resolve, reject) => {
			generateProcess.on("exit", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Generate script exited with code ${code}`));
				}
			});
		});

		console.log("\n✓ Image generation complete");
	} catch (error) {
		console.error("\n✗ Error:", error.message);
		process.exit(1);
	} finally {
		console.log("Stopping dev server...");
		devServer.kill();
		await setTimeout(1000);
		process.exit(0);
	}
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
