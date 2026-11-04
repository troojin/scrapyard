import type { Project } from '@/types';

export const INITIAL_MOCK_PROJECTS: Project[] = [
  {
    id: 'demo-1',
    title: 'GraphVector',
    github_url: 'https://github.com/rust-engine/graph-vector-abandoned',
    screenshot: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    reason_abandoned: 'LanceDB and sqlite-vec released production builds with SIMD C extensions. No point maintaining a standalone Rust storage engine solo.',
    salvageable_code: 'crates/engine/src/hnsw.rs: A self-contained, zero-allocation HNSW graph implementation with SIMD cosine distance for raw f32 slices.',
    user: 'user-rustacean',
    expand: {
      user: {
        id: 'user-rustacean',
        username: 'm_keller',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    },
    tags: ['Rust', 'Vector DB', 'HNSW', 'SIMD'],
    created: '2026-10-14T10:20:00.000Z',
  },
  {
    id: 'demo-2',
    title: 'DevSnip Generator',
    github_url: 'https://github.com/alex-dev/devsnip-video-core',
    screenshot: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    reason_abandoned: 'AWS Lambda cold starts running headless Chromium hit 18 seconds. Cloud costs hit $340 for 50 users.',
    salvageable_code: 'packages/renderer/src/syntax-highlighter.ts: Converts PrismJS tokens directly into animated SVG paths and WebGL vertices without headless browser dependencies.',
    user: 'user-alex',
    expand: {
      user: {
        id: 'user-alex',
        username: 'alex_chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
    },
    tags: ['TypeScript', 'WebGL', 'PrismJS', 'SVG'],
    created: '2026-10-22T14:40:00.000Z',
  },
  {
    id: 'demo-3',
    title: 'TabHoarder Clustering',
    github_url: 'https://github.com/browser-hacks/tab-hoarder-extension',
    screenshot: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    reason_abandoned: 'Chrome Manifest V3 killed background service worker persistence. Tabs dropped messaging every 30 seconds.',
    salvageable_code: 'extension/src/content/dedupe-cluster.ts: Pure JavaScript hierarchical clustering implementation that groups 1,000+ tab titles in under 8ms on a worker thread.',
    user: 'user-sarah',
    expand: {
      user: {
        id: 'user-sarah',
        username: 'sarah_lyn',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    },
    tags: ['JavaScript', 'Algorithms', 'Manifest V3', 'Clustering'],
    created: '2026-10-28T09:15:00.000Z',
  },
  {
    id: 'demo-4',
    title: 'GhostAuth Passkey Microservice',
    github_url: 'https://github.com/security-lab/ghost-auth-fido2',
    screenshot: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    reason_abandoned: 'Apple and Google ecosystem passkey sync differences were too painful for a side project. Major providers added free passkey support right after.',
    salvageable_code: 'pkg/webauthn/attestation.go: Completely dependency-free CBOR decoder and FIDO2 attestation parser that compiles without CGO.',
    user: 'user-marcus',
    expand: {
      user: {
        id: 'user-marcus',
        username: 'marcus_v',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
    },
    tags: ['Go', 'WebAuthn', 'CBOR', 'Security'],
    created: '2026-11-01T16:05:00.000Z',
  },
  {
    id: 'demo-5',
    title: 'PixelCraft Isometric Engine',
    github_url: 'https://github.com/gamedev-graveyard/pixelcraft-depth',
    screenshot: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    reason_abandoned: 'Spent 4 months perfecting topological depth sorting and dynamic z-indexing, but realized I had no game design or art assets.',
    salvageable_code: 'src/engine/isometric-sorter.ts: A cycle-free topological sorter for isometric objects with variable footprints and elevation offsets.',
    user: 'user-david',
    expand: {
      user: {
        id: 'user-david',
        username: 'dave_bit',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      },
    },
    tags: ['TypeScript', 'Canvas', 'Game Dev', 'Algorithms'],
    created: '2026-11-03T18:30:00.000Z',
  },
];
