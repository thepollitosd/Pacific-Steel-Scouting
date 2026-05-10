const { execSync } = require('child_process');
const priv = process.env.PRIV_KEY;
if (priv) {
  try {
    execSync('npx convex env set JWT_PRIVATE_KEY "' + priv.replace(/\n/g, '\\n') + '" --prod', { stdio: 'inherit' });
  } catch (e) {
    console.error(e);
  }
}
