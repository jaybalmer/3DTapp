This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Setup

This app uses email and password authentication with a whitelist system. Only 3 authorized email addresses can register.

### Step 1: Configure Allowed Emails

Edit `lib/allowedEmails.json` and add the 3 email addresses that should have access:

```json
[
  "user1@example.com",
  "user2@example.com",
  "user3@example.com"
]
```

### Step 2: Create First User

You can create the first user via command line:

```bash
npm run create-user <email> <password> [name]
```

Example:
```bash
npm run create-user admin@threedog.tech mypassword123 "Admin User"
```

**Note:** The email must be in the `allowedEmails.json` whitelist.

### Step 3: Additional Users

After the first user is created, additional users can register through the web interface at `/login` by clicking "Need an account? Register". However, registration is restricted - only emails in the whitelist can successfully register.

All users should use the same password as configured.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
