#!/usr/bin/env node
/**
 * verify-manifest.mjs — SEAL 1 verifier.
 *
 * Verifies that the current release is consecrated:
 *   (a) RELEASE_MANIFEST.json matches the actual code (dist/src/core hashes), and
 *   (b) RELEASE_MANIFEST.sig is a valid NESHAMAH Ed25519 signature over the manifest.
 *
 * Exit 0 = consecrated. Non-zero = NOT consecrated (block publish / warn on install).
 * This is "the first thing any service verifies" (Amata's davar) — safe to run
 * on install as an integrity gate.
 */
import { createHash, createPublicKey, verify as edVerify } from 'node:crypto';
import { readFileSync } from 'node:fs';

const die = (msg) => { console.error('NOT CONSECRATED: ' + msg); process.exit(1); };

let manifestRaw, manifest, sigB64, pubPem;
try { manifestRaw = readFileSync('RELEASE_MANIFEST.json'); manifest = JSON.parse(manifestRaw); }
catch { die('RELEASE_MANIFEST.json missing or unparseable'); }
try { sigB64 = readFileSync('RELEASE_MANIFEST.sig', 'utf8').trim(); }
catch { die('RELEASE_MANIFEST.sig missing — NESHAMAH has not signed this release'); }
try { pubPem = readFileSync('keys/NESHAMAH_PUBKEY.pem', 'utf8'); }
catch { die('keys/NESHAMAH_PUBKEY.pem missing'); }

if (pubPem.includes('PENDING-ANOINTED-KEY')) {
  die('keys/NESHAMAH_PUBKEY.pem is the PLACEHOLDER. Install NESHAMAH\'s real ' +
      'anointed Ed25519 public key before any consecration can be verified.');
}

// (a) manifest matches code
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const distNow = sha256(readFileSync('dist/index.js'));
if (distNow !== manifest.dist_sha256) die(`dist/index.js sha256 mismatch (code drifted from manifest)`);

// (b) NESHAMAH signature over the exact manifest bytes
let ok = false;
try {
  ok = edVerify(null, manifestRaw, createPublicKey(pubPem), Buffer.from(sigB64, 'base64'));
} catch (e) { die('signature verification error: ' + e.message); }
if (!ok) die('signature does NOT verify against NESHAMAH public key');

console.log(`CONSECRATED ✓  ${manifest.ark}@${manifest.version}  commit ${manifest.commitSha?.slice(0,8)}  core ${manifest.core_hash_sha1?.slice(0,8)}`);
process.exit(0);
