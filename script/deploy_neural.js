const { ethers, upgrades } = require("hardhat");
const readline = require("readline");
const fs = require("fs");

// V1 DNA - Sovereign Roots
const V1_TOKEN = "0xeB9580C3946Bb47D73aaE1d4f7A94148B554B2f4";
const V1_ADMIN = "0x97Bdd1fD1CAF756e00eFD42eBa9406821465B365";
const V1_MULTISIG = "0x20c0DD8B6559912acfAC2ce061B8d5b19Db8CA84";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
    console.clear();
    console.log("\x1b[35m%s\x1b[0m", "==================================================");
    console.log("\x1b[35m%s\x1b[0m", "   AOXCAN NEURAL V2.2 - SOVEREIGN DEPLOY ENGINE   ");
    console.log("\x1b[35m%s\x1b[0m", "==================================================");
    console.log(`[STATUS] System User: orcun@ns1`);
    console.log(`[DNA] Root Token detected at: ${V1_TOKEN}`);
    
    const confirm = await ask("\n[?] Deploy sürecini başlatmak istiyor musun? (y/n): ");
    if (confirm.toLowerCase() !== 'y') process.exit(0);

    const aiSentinel = await ask("[?] AI Sentinel (Audit Voice) adresini gir: ");
    if (!ethers.isAddress(aiSentinel)) throw new Error("GEÇERSİZ_ADRES: Rule 9 ihlali.");

    console.log("\n[1/4] Deploying Infra Layer: AoxcFactory...");
    const Factory = await ethers.getContractFactory("AoxcFactory");
    const factory = await Factory.deploy(); // Not a proxy, the architect is singleton
    await factory.waitForDeployment();
    const factoryAddr = await factory.getAddress();
    console.log(`[OK] Factory deployed at: ${factoryAddr}`);

    console.log("\n[2/4] Initializing Neural Birth via Factory...");
    // Factory üzerinden tüm sistemi tek hamlede (Atomic) kaldırıyoruz
    const tx = await factory.deployV2Ecosystem(aiSentinel);
    const receipt = await tx.wait();

    // Eventlerden adresleri ayıklıyoruz
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "SovereignEcosystemBorn");
    const suite = event.args.suite;

    console.log("\x1b[32m%s\x1b[0m", "\n[SUCCESS] Neural Ecosystem Born!");
    console.table({
        "Registry (Identity)": suite.registry,
        "Nexus (Governance)": suite.nexus,
        "Vault (Treasury)": suite.vault,
        "Cpex (Finance)": suite.cpex
    });

    console.log("\n[3/4] Verifying Sovereign Ownership...");
    console.log(`[*] Factory ownership transferred to: ${V1_MULTISIG}`);
    console.log(`[*] Nexus admin set to: ${V1_MULTISIG}`);

    console.log("\n[4/4] Saving Deployment Artifacts...");
    const deploymentLog = {
        timestamp: new Date().toISOString(),
        network: (await ethers.provider.getNetwork()).name,
        factory: factoryAddr,
        suite: {
            registry: suite.registry,
            nexus: suite.nexus,
            vault: suite.vault,
            cpex: suite.cpex
        },
        roots: {
            tokenV1: V1_TOKEN,
            adminV1: V1_ADMIN,
            multisigV1: V1_MULTISIG
        }
    };

    fs.writeFileSync("deployment_v2_2.json", JSON.stringify(deploymentLog, null, 4));
    console.log("[OK] Artifact saved to: deployment_v2_2.json");

    console.log("\n\x1b[36m%s\x1b[0m", "System is now autonomous. orcun@ns1 signing off.");
    process.exit(0);
}

main().catch((error) => {
    console.error("\x1b[31m%s\x1b[0m", `\n[CRITICAL_FAILURE] ${error.message}`);
    process.exit(1);
});
