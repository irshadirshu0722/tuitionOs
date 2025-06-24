import sdk from "node-appwrite";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const client = new sdk.Client()
    .setEndpoint("https://<REGION>.cloud.appwrite.io/v1")
    .setProject("<PROJECT_ID>")
    .setKey("<API_KEY>"); // Server-side key with `users` scope

  const users = new sdk.Users(client);

  try {
    const { userId } = req.body;
    await users.delete(userId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Appwrite delete error:", err);
    return res.status(500).json({ error: err.message });
  }
}