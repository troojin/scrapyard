import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function run() {
  await pb.collection('_superusers').authWithPassword('admin@scrapyard.local', 'scrapyard123456');

  const users = await pb.collections.getOne('users');
  users.listRule = '';
  users.viewRule = '';
  
  const hasUsername = users.fields.some((f) => f.name === 'username');
  if (!hasUsername) {
    users.fields.push({
      name: 'username',
      type: 'text',
      required: false,
      presentable: true,
      min: 2,
      max: 50,
    });
  }

  await pb.collections.update('users', users);

  const existing = await pb.collections.getFullList();
  const projectsExists = existing.some((c) => c.name === 'projects');

  if (!projectsExists) {
    await pb.collections.create({
      name: 'projects',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: '@request.auth.id = user',
      deleteRule: '@request.auth.id = user',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          presentable: true,
        },
        {
          name: 'github_url',
          type: 'url',
          required: true,
        },
        {
          name: 'screenshot',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/gif',
            'image/webp',
          ],
        },
        {
          name: 'reason_abandoned',
          type: 'text',
          required: true,
        },
        {
          name: 'salvageable_code',
          type: 'text',
          required: true,
        },
        {
          name: 'tags',
          type: 'json',
        },
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: users.id,
          maxSelect: 1,
        },
      ],
    });
  }
}

run();
