# ttldump

A minimalist temporary storage solution for text, images, and files with a 10-minute TTL (Time To Live).

## Features

- Upload and store text, images, PDFs, and other files temporarily
- Clean black and white minimalist UI
- 10-minute TTL for all items (automatically deleted after expiration)
- Copy button for text items
- Download button for files and images
- Real-time countdown timer for each item

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS (minimal usage, mostly custom CSS)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ttldump.git
cd ttldump
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure environment variables:
   
   Copy the `.env.example` file to `.env` and update the database connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/ttldump?schema=public"
```

4. Set up the database:

```bash
npx prisma migrate dev --name init
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Setting Up Cleanup Cron Job

To ensure expired items are automatically cleaned up, set up a cron job to call the cleanup endpoint:

```bash
# Run every minute
* * * * * curl http://localhost:3000/api/cron/cleanup
```

## Deployment

This project can be deployed on any platform that supports Next.js, such as Vercel, Netlify, or a custom server.

For production deployment, make sure to:

1. Set up a production PostgreSQL database
2. Configure the `DATABASE_URL` environment variable
3. Set up a cron job to clean up expired items

## License

MIT
