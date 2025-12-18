# Vercel Deployment Setup

Since Vercel uses serverless functions with read-only filesystems, user data must be stored in environment variables.

## Setting Up Environment Variables on Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

### USERS_DATA
This should be a JSON array of user objects:
```json
[
  {
    "email": "jaybalmer@gmail.com",
    "passwordHash": "467783b71d6a8e85760d2354ad59d752e274960c37688a09d4a55738a185c5a2",
    "name": "Jay"
  },
  {
    "email": "damien@quaestus.vc",
    "passwordHash": "your-hash-here",
    "name": "Damien"
  },
  {
    "email": "ysimkin@aflatminor.com",
    "passwordHash": "your-hash-here",
    "name": "Yuri"
  }
]
```

### ALLOWED_EMAILS
This should be a JSON array of allowed email addresses:
```json
[
  "jaybalmer@gmail.com",
  "damien@quaestus.vc",
  "ysimkin@aflatminor.com",
  "ysimkin@samizdatonline.org"
]
```

## Generating Password Hashes

To generate a password hash for a new user, run:
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('your-password').digest('hex'));"
```

Replace `your-password` with the actual password.

## Important Notes

- All users should use the **same password** as specified
- After adding users, you'll need to redeploy for changes to take effect
- The system will fall back to file-based storage in local development
- In production, new registrations will log a warning but won't persist (update env vars manually)

