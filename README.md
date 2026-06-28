# mock_api_portal
Mock portal and api for AI Fest.

## Cloudinary image hosting

Tester uploads use file inputs on `/developer#submit-game`. The browser posts the image
to `POST /api/uploads/image`; the app uploads it to Cloudinary with the private API
secret, then stores the returned `secure_url` in the existing database fields:

- `Game.coverUrl`
- `Game.heroUrl`
- `Artifact.imageUrl`

No Prisma migration is required for Cloudinary because the database already stores image
URLs as strings.

Required environment variables:

```bash
CLOUDINARY_URL="cloudinary://your-api-key:your-api-secret@your-cloud-name"
CLOUDINARY_UPLOAD_PRESET="game_portal"
CLOUDINARY_UPLOAD_FOLDER="region6-portal"
```

Set the same values in Vercel Project Settings -> Environment Variables. The
full `CLOUDINARY_URL` value is private; do not expose it in client code.

Tester upload flow:

1. Start the app with `npm run dev`.
2. Open `/developer#submit-game`.
3. Use the Cover, Hero, or Artifact upload buttons.
4. The portal uploads the file to Cloudinary and writes the hosted URL into the tester
   game JSON.
5. Submit the game to create the catalogue entry, first artifact, mock API key, and mock
   unlock session.

To upload seeded demo covers and artifacts to Cloudinary instead of using local
`/public` files:

```bash
CLOUDINARY_SEED_UPLOADS="true"
npm run db:seed
```

If `CLOUDINARY_SEED_UPLOADS` is unset or false, seeding keeps using local image paths.
