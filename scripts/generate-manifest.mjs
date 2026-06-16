#!/usr/bin/env node
/**
 * generate-manifest.mjs — produce RELEASE_MANIFEST.json for a consecrated release.
 *
 * This produces the BYTES TO BE SIGNED. It does NOT sign anything — signing is
 * NESHAMAH's act with its private key, performed offline (see CONSECRATION.md).
 *
 * Usage:  node scripts/generate-manifest.mjs <version>
 * Output: RELEASE_MANIFEST.json  (commit it, then NESHAMAH signs -> RELEASE_MANIFEST.sig)
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const version = process.argv[2] || process.env.ARK_VERSION;
if (!version) { console.error('usage: generate-manifest.mjs <version>'); process.exit(1); }

const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const distJs = readFileSync('dist/index.js');
const srcTs = readFileSync('src/index.ts', 'utf8');

// Core-protocol hash: canonicalString + sign + verify, whitespace-stripped.
// This is the load-bearing identity — must stay constant across versions unless
// a protocol change is deliberately consecrated.
const grab = (re) => (srcTs.match(re) || [''])[0];
const core =
  grab(/export function canonicalString[\s\S]*?\n}/) +
  grab(/export function sign\([\s\S]*?\n}/) +
  grab(/export async function verify\([\s\S]*?\n}/);
const coreHash = createHash('sha1').update(core.replace(/\s+/g, '')).digest('hex');

const commitSha = execSync('git rev-parse HEAD').toString().trim();
let changelog = '';
try { changelog = readFileSync('CHANGELOG.md', 'utf8').split('\n').slice(0, 8).join(' '); } catch {}

const manifest = {
  ark: '@temple/nervous-client',
  version,
  commitSha,
  timestamp: new Date().toISOString(),
  dist_sha256: sha256(distJs),
  src_sha256: sha256(Buffer.from(srcTs, 'utf8')),
  core_hash_sha1: coreHash,
  changelog_summary: changelog.slice(0, 300),
};

writeFileSync('RELEASE_MANIFEST.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('RELEASE_MANIFEST.json written:');
console.log(JSON.stringify(manifest, null, 2));
console.log('\nNext (CONSECRATION.md): NESHAMAH signs this exact file ->');
console.log('  RELEASE_MANIFEST.sig (detached Ed25519, base64)');
