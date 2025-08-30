# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/375fb2f6-2a6f-4455-83ed-bfa2bded2f1b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/375fb2f6-2a6f-4455-83ed-bfa2bded2f1b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Authentication & Database)

## Authentication & Supabase Setup

### CRITICAL: Supabase Authentication Configuration

Before deploying to production, you MUST configure these Supabase Auth settings:

1. **Site URL Configuration**
   - Go to [Supabase Auth Settings](https://supabase.com/dashboard/project/zsptshspjdzvhgjmnjtl/auth/providers)
   - Set **Site URL** to: `https://alihiddenproduct.com`

2. **Redirect URLs Configuration** 
   - In the same settings page, add these redirect URLs:
   - `https://alihiddenproduct.com/reset-password`
   - `https://alihiddenproduct.com/` (for sign up confirmations)

3. **Admin User Setup**
   - Go to [Supabase Users](https://supabase.com/dashboard/project/zsptshspjdzvhgjmnjtl/auth/users)
   - Create admin user with email: `almizancolab@gmail.com`
   - The system will automatically assign admin role via database trigger

4. **SMTP Configuration** (Optional but recommended)
   - Configure SMTP in Supabase Auth settings for password reset emails
   - Without SMTP, password reset emails won't be sent

### Password Reset Flow

- Reset emails will redirect to: `https://alihiddenproduct.com/reset-password`
- The app uses `VITE_APP_URL` environment variable with fallback to production domain
- Localhost users see warning banners about development limitations

### Important Notes

- **Re-send reset emails** after changing Site URL and Redirect URL settings
- Password reset links are time-limited and single-use
- Admin users have full access to all management features

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/375fb2f6-2a6f-4455-83ed-bfa2bded2f1b) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
