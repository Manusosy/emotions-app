# Emotions App

A mental health platform connecting users with mental health ambassadors.

## Getting Started

These instructions will help you set up and run the project on your local machine.

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account (for the database)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

or if you're using yarn:

```bash
yarn install
```

3. Start the development server:

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

The app should now be running at [http://localhost:8080](http://localhost:8080) (or another port if 8080 is busy).

## Database Migrations

The application will automatically try to ensure the required database structure when it starts up. If you need to manually apply migrations:

1. Set your Supabase service key as an environment variable:

```bash
export SUPABASE_SERVICE_KEY=your_service_key_here
```

2. Run the migration script:

```bash
node src/integrations/supabase/apply-migrations.js
```

## Ambassador Dashboard Updates

The Ambassador dashboard has been completely redesigned with:

- A step-by-step wizard interface for profile setup
- Improved profile completion tracking
- Welcome dialog for new ambassadors 
- Fixed database schema issues
- Streamlined user experience
- Consolidated dashboard components (removing duplicate implementations)
- Added recent activities section for better activity tracking

### Key Features

- **Profile Wizard**: Multi-step form to guide ambassadors through profile setup
- **Profile Completion Indicator**: Shows progress as ambassadors complete their profile
- **Welcome Dialog**: Provides guidance for new ambassadors
- **Responsive Design**: Works well on mobile and desktop
- **Visual Feedback**: Clear indicators for errors and successful actions
- **Recent Activities**: Displays recent interactions with patients
- **Consolidated Architecture**: Single source of truth for dashboard functionality

## Troubleshooting

If you encounter any issues:

1. Make sure your Supabase credentials are correct
2. Check that all required database tables and columns exist
3. Clear your browser cache
4. Try running the database migrations manually

## Built With

* [React](https://reactjs.org/) - The web framework used
* [TypeScript](https://www.typescriptlang.org/) - Type system
* [Supabase](https://supabase.io/) - Backend and database
* [TailwindCSS](https://tailwindcss.com/) - CSS framework
* [shadcn/ui](https://ui.shadcn.com/) - UI component library

## Contact

For any inquiries, please reach out to [soitaemanuel@gmail.com](mailto:soitaemanuel@gmail.com)

## Fixing User Roles in Supabase Authentication Dashboard

To fix the issue where user roles are not properly displayed in the Supabase authentication dashboard, run the following command:

```bash
# First, make sure your environment variables are set
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Then run the migration script
node apply_role_migration.js
```

This script will:
1. Create the necessary `execute_sql` function if it doesn't already exist
2. Apply a migration that copies role information from your application's `users` table to the Supabase `auth.users` table's `raw_user_meta_data`
3. Set up triggers to keep this information in sync

After running this script, you should be able to see user roles (patient, ambassador) correctly displayed in the Supabase authentication dashboard.

> **Note:** We've updated the script to use the correct column name `raw_user_meta_data` instead of `raw_user_metadata` based on the Supabase schema.

### Manual Option

If the script doesn't work, you can run the SQL directly in the Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Open the file `manual_fix_user_roles.sql` from this repository
4. Copy and paste the contents into the SQL Editor
5. Run the query

This will perform the same updates as the script and ensure your user roles are correctly displayed in the authentication dashboard.

## Viewing All Patients in Ambassador Dashboard

To ensure that ambassadors can see all patients in the system on the `/ambassador-dashboard/patients` page, follow these steps:

1. First, make sure user roles are correctly set up by running:

```bash
node apply_role_migration.js
```

2. Then, apply the patient user function to enable fetching all patients:

```bash
node apply_patient_function.js
```

3. If the automated scripts don't work, you can run the SQL directly in the Supabase SQL Editor:
   - First run `manual_fix_user_roles.sql` to fix the user roles
   - Then run `manual_add_patient_function.sql` to add the patient user function

These changes will:
1. Ensure all users have their roles properly set in the Supabase authentication system
2. Create a function to retrieve all patients from the system
3. Update the ambassador dashboard to show all patients, regardless of whether they're directly connected to the ambassador

After applying these changes, ambassadors will be able to view all patients in the system on the patients page of their dashboard.

## Viewing All Ambassadors in Patient Dashboard

To ensure that patients can see all available ambassadors in the system on the appointments page for booking, follow these steps:

1. First, make sure user roles are correctly set up by running:

```bash
node apply_role_migration.js
```

2. Then, apply the ambassador user function to enable fetching all ambassadors:

```bash
node apply_ambassador_function.js
```

3. If the automated scripts don't work, you can run the SQL directly in the Supabase SQL Editor:
   - First run `manual_fix_user_roles.sql` to fix the user roles
   - Then run `manual_add_ambassador_function.sql` to add the ambassador user function

These changes will:
1. Ensure all users have their roles properly set in the Supabase authentication system
2. Create a function to retrieve all ambassadors from the system
3. Update the patient dashboard to show all ambassadors, regardless of previous connections

After applying these changes, patients will be able to view and book appointments with all available ambassadors in the system from their dashboard's appointment page.
