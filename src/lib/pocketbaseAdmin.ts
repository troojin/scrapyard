import PocketBase from 'pocketbase';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8090';
const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@scrapyard.local';
const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'scrapyard123456';

export async function getPocketBaseAdmin(): Promise<PocketBase> {
  const pb = new PocketBase(apiUrl);
  try {
    await pb.collection('_superusers').authWithPassword(adminEmail, adminPassword);
  } catch {
    try {
      await (pb as unknown as { admins: { authWithPassword: (e: string, p: string) => Promise<unknown> } }).admins.authWithPassword(adminEmail, adminPassword);
    } catch {
    }
  }
  return pb;
}
