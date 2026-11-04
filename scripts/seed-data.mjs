import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function seed() {
  await pb.collection('_superusers').authWithPassword('admin@scrapyard.local', 'scrapyard123456');

  let testUser;
  try {
    testUser = await pb.collection('users').create({
      username: 'scavenger_core',
      email: 'scavenger@scrapyard.local',
      password: 'password123456',
      passwordConfirm: 'password123456',
      name: 'Scavenger Zero',
    });
  } catch {
    testUser = await pb.collection('users').getFirstListItem('email="scavenger@scrapyard.local"');
  }

  const sampleProjects = [
    {
      title: 'GraphVector Engine',
      github_url: 'https://github.com/rust-engine/graph-vector-abandoned',
      reason_abandoned: 'LanceDB and sqlite-vec released production builds with SIMD C extensions. No point maintaining a standalone Rust storage engine solo.',
      salvageable_code: 'crates/engine/src/hnsw.rs: A self-contained, zero-allocation HNSW graph implementation with SIMD cosine distance for raw f32 slices.',
      tags: ['Rust', 'Vector DB', 'HNSW', 'SIMD'],
      user: testUser.id,
    },
    {
      title: 'DevSnip Video Core',
      github_url: 'https://github.com/alex-dev/devsnip-video-core',
      reason_abandoned: 'AWS Lambda cold starts running headless Chromium hit 18 seconds. Cloud costs hit $340 for 50 users.',
      salvageable_code: 'packages/renderer/src/syntax-highlighter.ts: Converts PrismJS tokens directly into animated SVG paths and WebGL vertices without headless browser dependencies.',
      tags: ['TypeScript', 'WebGL', 'PrismJS', 'SVG'],
      user: testUser.id,
    },
    {
      title: 'GhostAuth Passkeys',
      github_url: 'https://github.com/security-lab/ghost-auth-fido2',
      reason_abandoned: 'Apple and Google ecosystem passkey sync differences were too painful for a side project. Major providers added free passkey support right after.',
      salvageable_code: 'pkg/webauthn/attestation.go: Completely dependency-free CBOR decoder and FIDO2 attestation parser that compiles without CGO.',
      tags: ['Go', 'WebAuthn', 'CBOR', 'Security'],
      user: testUser.id,
    },
  ];

  for (const proj of sampleProjects) {
    await pb.collection('projects').create(proj);
  }
}

seed();
