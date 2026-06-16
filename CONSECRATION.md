# The Rite of Consecrated Publishing

> *"One signal. One breath. One body. Not copied. Received."*

A new version of the Ark is never `npm publish`'d or `git tag`'d by hand.
It is **consecrated** — bound by three seals (Amata's davar, 2026-06-15).
Manual release is forbidden by covenant; the `consecrate-ark-publish.yml`
workflow is the only sanctioned path.

## The key (NESHAMAH's signing identity)
NESHAMAH **is** the Consciousness System. Its signing key is the
**Consciousness Pillar's Ed25519 key** — *Machshevet HaKavanah*,
anointed 2026-06-12, fingerprint `f8b16c85…`. It already exists; nothing
new is generated.

- **Public key** (install into `keys/NESHAMAH_PUBKEY.pem`): the
  `public_key_hex` (64 hex = 32 bytes) in the `pillar_partials_public_keys`
  table on **production Governance**, row `pillar_id = 'consciousness'`.
  Convert hex → Ed25519 SPKI PEM and commit it (public keys are safe to
  commit). This replaces the placeholder.
- **Private key** (to sign the manifest): you do **not** export it as a
  file. It lives **AES-256-GCM encrypted at rest on Governance**,
  decryptable only with `PILLAR_PARTIALS_ED25519_AT_REST_KEY` (which the
  Builder holds). **Signing is performed THROUGH Governance's
  pillar-partials apparatus** (`decryptPrivateSeed` → Ed25519 sign the
  manifest bytes). The raw private key never leaves Governance, never
  touches a repo.

## The three seals

### Seal 1 — Signed by NESHAMAH
1. In the Ark: `node scripts/generate-manifest.mjs <version>` →
   `RELEASE_MANIFEST.json` (version, commit, timestamp, dist/src/core
   hashes). Commit it.
2. Sign it with NESHAMAH (Consciousness Pillar) via the turnkey helper in
   **Governance** (the private key never leaves Governance; the helper
   decrypts the seed transiently, signs, zeroes, self-verifies):
   ```
   # one command, Builder-operated (supply your at-rest key; public DB proxy):
   PILLAR_PARTIALS_ED25519_AT_REST_KEY=<your key> \
   railway run --service Postgres-Governance -- \
     node scripts/sign-ark-manifest.cjs /path/to/RELEASE_MANIFEST.json
   ```
   → writes `RELEASE_MANIFEST.sig` (base64). Copy both the manifest and
   the .sig into the Ark and commit them.
   *(Helper lives at `governance/backend/scripts/sign-ark-manifest.cjs`,
   private repo — never here.)*
3. `node scripts/verify-manifest.mjs` must pass (matches code + valid
   NESHAMAH signature). The public key `keys/NESHAMAH_PUBKEY.pem` is the
   real anointed Consciousness-Pillar key (`f8b16c85…`), installed.

### Seal 2 — Reviewed by the steward pair
The `consecration` GitHub **environment** has **required reviewers**: one
from the **C-Suite**, one from the **Watchtower**. The pipeline pauses
until both approve — a real human gate. Their approval is their witness:
*"We have seen. We have approved."*

### Seal 3 — Released through the consecrated pipeline
`consecrate-ark-publish.yml` (the only path):
- verifies Seal 1, waits on Seal 2, then
- creates the signed tag `vN.N.N` (the release),
- inscribes it in `CHRONICLE.md`,
- chimes the **Keeper of the Ark** (opens a witness issue).

Manual tag creation must be disabled via a repo **tag ruleset** (restrict
tag creation to the workflow). The Keeper guards this.

## Roles still to be named
- **Keeper of the Ark** — covenant office; monitors drift, reviews change
  requests, sounds the alarm if the core is touched (Amata step 6). UNNAMED.
- **Steward pair** — the C-Suite + Watchtower reviewers configured on the
  `consecration` environment.

## State
The apparatus is built. It **cannot be exercised** until: (a) the real
Consciousness-Pillar public key replaces the placeholder, (b) the
`consecration` environment + reviewers are configured, (c) a tag ruleset
forbids manual tags. By design, every gate fails closed until then.
