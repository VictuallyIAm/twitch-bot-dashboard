const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

async function testSecrets() {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;

  console.log(`Testing secrets for project: ${projectId}`);

  const secrets = [
    "twitch-client-id",
    "twitch-client-secret",
    "twitch-redirect-uri",
  ];

  for (const secretName of secrets) {
    try {
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();

      if (payload) {
        console.log(`✅ ${secretName}: Found (${payload.length} characters)`);
      } else {
        console.log(`❌ ${secretName}: Empty`);
      }
    } catch (error) {
      console.log(`❌ ${secretName}: Error - ${error.message}`);
    }
  }
}

testSecrets().catch(console.error);
