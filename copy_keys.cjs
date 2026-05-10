const { spawnSync } = require('child_process');

console.log("Getting JWKS from dev...");
const jwksRes = spawnSync('npx.cmd', ['convex', 'env', 'get', 'JWKS'], { encoding: 'utf8', shell: true });
const jwks = jwksRes.stdout ? jwksRes.stdout.trim() : null;

if (!jwks) {
  console.error("Failed to get JWKS");
  process.exit(1);
}

console.log("Setting JWKS in prod...");
// Escape double quotes because Windows batch files eat them
const escapedJwks = jwks.replace(/"/g, '\\"');
const setRes = spawnSync('npx.cmd', ['convex', 'env', 'set', 'JWKS', escapedJwks, '--prod'], { stdio: 'inherit' });

console.log("Done.");
