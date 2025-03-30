# Rock Clicker Game

A mobile idle/clicker game built with React Native and Expo, featuring user authentication, cloud saves, and a rebirth system.

## Features

- **User Authentication**: Sign up, login, and password reset with Supabase
- **Cloud Save/Load**: Automatically save your progress to the cloud
- **Upgrading System**: Purchase upgrades to increase your coins per click
- **Auto Miners**: Earn coins automatically over time
- **Achievements**: Unlock achievements as you progress
- **Special Upgrades**: Unlock special abilities and bonuses
- **Rebirth System**: Reset your progress for permanent bonuses
- **Dark Theme**: Modern UI with a sleek dark theme

## Prerequisites

- Node.js (v18.18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account for backend services

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rock-clicker.git
   cd rock-clicker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a Supabase project at https://supabase.com
   - Update `app.json` with your Supabase URL and anon key:
     ```json
     "extra": {
       "supabaseUrl": "YOUR_SUPABASE_URL",
       "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
     }
     ```

4. Set up Supabase database tables:
   - `users`: Store user profile information
     - `id` (primary key, references auth.users.id)
     - `username` (text)
     - `email` (text)
   
   - `game_states`: Store main game state
     - `user_id` (primary key, references users.id)
     - `coins` (bigint)
     - `total_coins_earned` (bigint)
     - `cpc` (float)
     - `base_cpc` (float)
     - `total_clicks` (integer)
     - `rebirths` (integer)
     - `rebirth_tokens` (integer)
     - `gold_coins` (integer)
     - `last_saved` (timestamp)
   
   - `user_upgrades`: Store owned upgrades
     - `id` (primary key)
     - `user_id` (references users.id)
     - `upgrade_id` (text)
     - `quantity` (integer)

   - `user_rocks`: Store unlocked rocks
     - `id` (primary key)
     - `user_id` (references users.id)
     - `rock_id` (text)
     - `unlocked` (boolean)

   - `user_achievements`: Store unlocked achievements
     - `id` (primary key)
     - `user_id` (references users.id)
     - `achievement_id` (text)
     - `unlocked_at` (timestamp)

## Database Setup

This game uses Supabase for user authentication and cloud saves. Follow these steps carefully:

### 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com) and sign in or create an account
2. Click "New Project" and fill in:
   - Organization (create one if needed)
   - Name (e.g., "rock-clicker")
   - Database Password (save this for later if needed)
   - Region (choose one close to you)
3. Click "Create new project" and wait for setup to complete (may take a few minutes)

### 2. Set Up Authentication

1. In your Supabase project, go to "Authentication" in the left sidebar
2. Under "Authentication" → "Providers", make sure "Email" is enabled
3. For local development, you can set "Confirm email" to "No verification" temporarily
4. Save changes if you've made any

### 3. Create Database Tables

This is the **MOST IMPORTANT** step. If not done correctly, you'll see errors like `relation "public.game_states" does not exist`.

1. In your Supabase project, go to "SQL Editor" in the left sidebar
2. Click "New Query"
3. **IMPORTANT**: Copy and paste the **ENTIRE** contents of `lib/supabase/schema.sql` into the query editor
4. Click "Run" to execute all the queries at once
5. Wait for it to complete - you should see "Success" with no errors
6. Go to "Table Editor" in the left sidebar and verify that the following tables appear:
   - `users`
   - `game_states`
   - `user_upgrades`
   - `user_rocks`
   - `user_achievements`
7. If the tables don't appear, try refreshing the page and check again

### 4. Set Environment Variables

1. Get your Supabase URL and anon key:
   - Go to "Project Settings" → "API" in the left sidebar
   - Copy the "URL" and "anon/public" key
   
2. Create/update `.env` file in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. If testing on web, also update `app.json`:
   ```json
   "extra": {
     "supabaseUrl": "YOUR_SUPABASE_URL",
     "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
   }
   ```

### 5. Testing Your Setup

1. Start the app with `npx expo start`
2. Create an account or sign in
3. If you see errors about tables not existing, verify that you've completed step 3 correctly
4. Check the console logs for more detailed error messages

### Troubleshooting

If you're experiencing problems with the Supabase database connection, the app now includes built-in troubleshooting tools:

1. **Database Check Utility**: On the welcome screen, click the database icon at the bottom to run a quick connection check. This will verify if your Supabase connection is working properly.

2. **Admin Dashboard**: If you're logged in, you can access the admin dashboard by clicking the shield icon on the welcome screen. The admin dashboard provides:
   - Detailed database connection status
   - Configuration information
   - Console logs for debugging
   - Reset option to clear local state and force a fresh login

3. **Common Database Errors**:

   - **"relation 'public.users' does not exist"**: This critical error means the database tables haven't been properly created. You have two options to fix it:
   
     **Option 1 - Quick Fix:**
     1. Go to SQL Editor in Supabase
     2. Create a new query
     3. Copy the content of `rock-clicker/lib/supabase/fix_database.sql`
     4. Paste it and click "Run" to execute the fix script
     5. Refresh the Table Editor to verify all tables were created
     6. Restart your app
     
     **Option 2 - Complete Setup:**
     1. Go to SQL Editor in Supabase
     2. Create a new query
     3. Copy the **ENTIRE** content of `rock-clicker/lib/supabase/schema.sql`
     4. Paste it and click "Run" to execute all statements at once
     5. Very important: Make sure you copy the whole file and run it all at once, not in parts
     6. Refresh the Table Editor to verify all tables were created
     7. Restart your app
   
   - **"relation 'public.game_states' does not exist"**: Similar to the above error, this means the database tables haven't been created. Follow the same steps.
   
   - **JWT verification failed**: Your Supabase URL or anon key may be incorrect. Check your `.env` and `app.json` files to ensure they have the correct values.
   
   - **Network error**: Check your internet connection and verify that your Supabase project is active.

If you continue to experience issues, try the following:

1. Run the admin dashboard's database check to get detailed error information
2. Verify that all tables were created correctly in the Supabase dashboard
3. Check for any typos in your environment variables
4. Try signing out and signing back in
5. If all else fails, use the Reset option in the admin dashboard

## How User Authentication and Data Sync Works

The Rock Clicker game uses a carefully designed database structure to link authenticated users with their game data:

1. **Authentication Flow**:
   - When a user signs up or logs in using Supabase Auth, they get an auth user record in `auth.users` table
   - On successful auth, we automatically create a corresponding record in the `public.users` table with the same UUID
   - This links the auth user to our game tables via foreign key relationships

2. **Game Data Storage**:
   - All game data is stored as a JSON object in the `game_states` table
   - The `game_states` table has a foreign key reference to the `public.users` table
   - This ensures data integrity and proper relationships between users and their game data

3. **Data Synchronization Logic**:
   - On app startup, we load data from both local storage (AsyncStorage) and cloud (Supabase)
   - We compare timestamps to determine which is newer (cloud or local)
   - We always pick the newest data to ensure players don't lose progress
   - The app periodically saves to both local storage and cloud when the user is logged in
   - This creates a seamless experience across different devices

4. **Admin Dashboard**:
   - The app includes an Admin Dashboard accessible to signed-in users
   - It provides tools to check database connectivity and run tests
   - If issues are detected, it offers solutions to fix database setup problems
   - You can access it by clicking the shield icon on the welcome screen

The implementation ensures robust data persistence while maintaining proper security through Row Level Security (RLS) policies that ensure users can only access their own data.

## Foreign Key Constraint Issues

If you encounter a foreign key constraint error like:

```
Error inserting game state: {"code": "23503", "details": "Key is not present in table \"users\".", "hint": null, "message": "insert or update on table \"game_states\" violates foreign key constraint \"game_states_user_id_fkey\""}
```

This is usually because the user exists in the `auth.users` table but not in the `public.users` table. This can happen if the user was created before the database setup was completed.

To fix this issue:

1. Make sure you're signed in
2. Run the user creation test: `npm run test:user`
3. This will create a user record in the `public.users` table with the same ID as in `auth.users`

You can also test the full database setup with:

```
npm test
```

This will verify connections, check all tables, and test data synchronization.

### Row-Level Security (RLS) Policy Errors

If you see an error like:

```
Error creating user: {"code": "42501", "details": null, "hint": null, "message": "new row violates row-level security policy for table \"users\""}
```

This happens because the RLS policies aren't correctly set up to allow users to create their own user records. To fix it:

**Option 1 - Quick Fix (Recommended):**
Run the built-in fixer script:
```bash
npm run fix:rls
```
This will attempt to update the RLS policies automatically and test if they're working.

**Option 2 - Simple Guide:**
If you're having trouble with the ts-node version, run the simple guide:
```bash
npm run fix:rls:simple
```
This will print step-by-step instructions for fixing the RLS policies manually.

**Option 3 - Manual Fix:**
1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy the contents of `lib/supabase/fix-rls.sql`
4. Run the query to update the RLS policies
5. Try running the test again with `npm run test:user`

The issue should be resolved, and users will be able to create their own records in the `users` table.

## Running the App

Start the development server:

```bash
npx expo start
```

Then:
- Press 'a' to open on Android emulator
- Press 'i' to open on iOS simulator
- Scan the QR code with Expo Go app on your physical device

## Game Mechanics

- **Clicking**: Tap the rock to earn coins
- **Upgrades**: Buy upgrades in the shop to increase your CPC (Coins Per Click)
- **Auto Miners**: Purchase auto miners to generate coins automatically
- **Achievements**: Complete tasks to unlock achievements and earn bonuses
- **Special Upgrades**: Spend gold coins to unlock special upgrades with unique effects
- **Rebirth**: Reset your progress to earn rebirth tokens, which provide permanent bonuses

## Technology Stack

- **Frontend**: React Native, Expo, React Native Paper
- **State Management**: React Context API
- **Backend**: Supabase (Authentication, Database)
- **Storage**: AsyncStorage for local data, Supabase for cloud saves

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# BoulderBlitz
