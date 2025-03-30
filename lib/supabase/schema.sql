-- =============================================
-- ROCK CLICKER DATABASE SETUP SCRIPT
-- =============================================
-- IMPORTANT: RUN THIS ENTIRE SCRIPT AT ONCE!
-- DO NOT run sections separately or tables will be missing.
--
-- HOW TO RUN:
-- 1. Go to Supabase dashboard (https://app.supabase.com)
-- 2. Select your project
-- 3. Go to "SQL Editor" in the left sidebar
-- 4. Click "New Query"
-- 5. Copy and paste THIS ENTIRE FILE
-- 6. Click "RUN" to execute all statements
-- =============================================

-- First, enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Make sure we're working with the correct schema
SET search_path TO public;

-- Clean up any existing triggers to avoid conflicts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_users_updated_at ON public.users';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'game_states'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_game_states_updated_at ON public.game_states';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_upgrades'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_user_upgrades_updated_at ON public.user_upgrades';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_rocks'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_user_rocks_updated_at ON public.user_rocks';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_achievements'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements';
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- USERS TABLE - MUST BE CREATED FIRST!
-- =============================================

-- First check if auth schema is set up properly
DO $$
DECLARE
    auth_schema_exists BOOLEAN;
    auth_users_exists BOOLEAN;
BEGIN
    -- Check if auth schema exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
    ) INTO auth_schema_exists;

    IF NOT auth_schema_exists THEN
        RAISE NOTICE 'Warning: auth schema does not exist. This may cause issues with users table creation.';
    END IF;
    
    -- Check if auth.users table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) INTO auth_users_exists;
    
    IF NOT auth_users_exists THEN
        RAISE NOTICE 'Warning: auth.users table does not exist. We will create the users table without the foreign key.';
    END IF;
END $$;

-- Create the users table with conditional foreign key
DO $$
BEGIN
    -- Check if table exists before creating
    IF NOT EXISTS (
        SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'
    ) THEN
        -- Check if auth.users exists before creating with foreign key
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'auth' AND table_name = 'users'
        ) THEN
            -- Users table with auth.users foreign key
            EXECUTE 'CREATE TABLE public.users (
                id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                username TEXT,
                email TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            )';
            RAISE NOTICE 'Created users table with auth.users foreign key';
        ELSE
            -- Create users table without foreign key as fallback
            EXECUTE 'CREATE TABLE public.users (
                id UUID PRIMARY KEY,
                username TEXT,
                email TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            )';
            RAISE NOTICE 'Created users table WITHOUT auth.users foreign key';
        END IF;
    ELSE
        RAISE NOTICE 'Table users already exists, skipping';
    END IF;
END $$;

-- =============================================
-- GAME DATA TABLES 
-- =============================================

-- Game states table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'game_states'
  ) THEN
    CREATE TABLE public.game_states (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      game_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store the full game state as JSON
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Create index on user_id for faster lookups
    CREATE INDEX idx_game_states_user_id ON public.game_states(user_id);
    
    RAISE NOTICE 'Created game_states table';
  ELSE
    RAISE NOTICE 'Table game_states already exists, skipping';
  END IF;
END $$;

-- User upgrades table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_upgrades'
  ) THEN
    CREATE TABLE public.user_upgrades (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      upgrade_id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, upgrade_id)
    );
    
    RAISE NOTICE 'Created user_upgrades table';
  ELSE
    RAISE NOTICE 'Table user_upgrades already exists, skipping';
  END IF;
END $$;

-- User rocks (unlocked rocks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_rocks'
  ) THEN
    CREATE TABLE public.user_rocks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      rock_id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, rock_id)
    );
    
    RAISE NOTICE 'Created user_rocks table';
  ELSE
    RAISE NOTICE 'Table user_rocks already exists, skipping';
  END IF;
END $$;

-- User achievements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_achievements'
  ) THEN
    CREATE TABLE public.user_achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, achievement_id)
    );
    
    RAISE NOTICE 'Created user_achievements table';
  ELSE
    RAISE NOTICE 'Table user_achievements already exists, skipping';
  END IF;
END $$;

-- =============================================
-- TRIGGERS FOR UPDATING TIMESTAMPS
-- =============================================

-- Add updated_at triggers to tables
DO $$
BEGIN
  -- Users table trigger
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Game states table trigger
  CREATE TRIGGER update_game_states_updated_at
    BEFORE UPDATE ON public.game_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- User upgrades table trigger
  CREATE TRIGGER update_user_upgrades_updated_at
    BEFORE UPDATE ON public.user_upgrades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- User rocks table trigger
  CREATE TRIGGER update_user_rocks_updated_at
    BEFORE UPDATE ON public.user_rocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
  -- User achievements table trigger
  CREATE TRIGGER update_user_achievements_updated_at
    BEFORE UPDATE ON public.user_achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  RAISE NOTICE 'Created all triggers';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating triggers, some may already exist: %', SQLERRM;
END $$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Setup RLS to ensure users can only access their own data
DO $$
BEGIN
  -- Drop existing policies to avoid duplicates
  DROP POLICY IF EXISTS users_select_policy ON public.users;
  DROP POLICY IF EXISTS users_update_policy ON public.users;
  DROP POLICY IF EXISTS game_states_select_policy ON public.game_states;
  DROP POLICY IF EXISTS game_states_insert_policy ON public.game_states;
  DROP POLICY IF EXISTS game_states_update_policy ON public.game_states;
  DROP POLICY IF EXISTS game_states_delete_policy ON public.game_states;
  DROP POLICY IF EXISTS user_upgrades_select_policy ON public.user_upgrades;
  DROP POLICY IF EXISTS user_upgrades_insert_policy ON public.user_upgrades;
  DROP POLICY IF EXISTS user_upgrades_update_policy ON public.user_upgrades;
  DROP POLICY IF EXISTS user_upgrades_delete_policy ON public.user_upgrades;
  DROP POLICY IF EXISTS user_rocks_select_policy ON public.user_rocks;
  DROP POLICY IF EXISTS user_rocks_insert_policy ON public.user_rocks;
  DROP POLICY IF EXISTS user_rocks_update_policy ON public.user_rocks;
  DROP POLICY IF EXISTS user_rocks_delete_policy ON public.user_rocks;
  DROP POLICY IF EXISTS user_achievements_select_policy ON public.user_achievements;
  DROP POLICY IF EXISTS user_achievements_insert_policy ON public.user_achievements;
  DROP POLICY IF EXISTS user_achievements_update_policy ON public.user_achievements;
  DROP POLICY IF EXISTS user_achievements_delete_policy ON public.user_achievements;

  -- First check if auth.uid() function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'uid' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
  ) THEN
    -- Enable RLS on all tables
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_rocks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
    
    -- Users can only read and update their own data
    CREATE POLICY users_select_policy ON public.users
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY users_insert_policy ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    CREATE POLICY users_update_policy ON public.users
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    
    -- Game states policies
    CREATE POLICY game_states_select_policy ON public.game_states
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY game_states_insert_policy ON public.game_states
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY game_states_update_policy ON public.game_states
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY game_states_delete_policy ON public.game_states
      FOR DELETE USING (auth.uid() = user_id);
    
    -- User upgrades policies
    CREATE POLICY user_upgrades_select_policy ON public.user_upgrades
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY user_upgrades_insert_policy ON public.user_upgrades
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY user_upgrades_update_policy ON public.user_upgrades
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY user_upgrades_delete_policy ON public.user_upgrades
      FOR DELETE USING (auth.uid() = user_id);
    
    -- User rocks policies
    CREATE POLICY user_rocks_select_policy ON public.user_rocks
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY user_rocks_insert_policy ON public.user_rocks
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY user_rocks_update_policy ON public.user_rocks
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY user_rocks_delete_policy ON public.user_rocks
      FOR DELETE USING (auth.uid() = user_id);
    
    -- User achievements policies
    CREATE POLICY user_achievements_select_policy ON public.user_achievements
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY user_achievements_insert_policy ON public.user_achievements
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY user_achievements_update_policy ON public.user_achievements
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY user_achievements_delete_policy ON public.user_achievements
      FOR DELETE USING (auth.uid() = user_id);
  
    RAISE NOTICE 'Created all RLS policies';
  ELSE
    RAISE NOTICE 'Warning: auth.uid() function not found. Skipping RLS policies.';
    RAISE NOTICE 'RLS will need to be configured manually for security.';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating RLS policies: %', SQLERRM;
END $$;

-- Grant necessary permissions to authenticated users if role exists
DO $$
BEGIN
  -- Check if the authenticated role exists
  IF EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
  ) THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_states TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_upgrades TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_rocks TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
    RAISE NOTICE 'Granted permissions to authenticated role';
  ELSE
    RAISE NOTICE 'Warning: authenticated role does not exist. Skipping permission grants.';
    RAISE NOTICE 'This may be expected in some development environments.';
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END $$;

-- =============================================
-- VERIFICATION AND TROUBLESHOOTING
-- =============================================
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  -- Count how many of our expected tables exist
  SELECT COUNT(*) INTO table_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename IN ('users', 'game_states', 'user_upgrades', 'user_rocks', 'user_achievements');
  
  RAISE NOTICE '======================================================';
  RAISE NOTICE 'Rock Clicker Database Setup Complete!';
  RAISE NOTICE '======================================================';
  RAISE NOTICE '✅ Found % of 5 required tables', table_count;
  
  IF table_count < 5 THEN
    RAISE NOTICE '⚠️ Warning: Not all tables were created!';
    RAISE NOTICE 'This could be due to an error or permission issue.';
  ELSE
    RAISE NOTICE '✅ All tables were created successfully!';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Go to the "Table Editor" in Supabase to verify your tables';
  RAISE NOTICE '2. Restart your app and try again';
END $$;

/*
TROUBLESHOOTING COMMON ERRORS:

1. "relation "auth.users" does not exist"
   - This is usually because the auth schema is not properly set up or not accessible
   - Solution: The script will now attempt to create tables without the foreign key
   - This should allow your game to work, but you may need to set up auth later

2. "relation already exists"
   - This is usually fine. It means the table was already created.

3. "must be owner of table"
   - Make sure you're using the correct Supabase project.
   - Try refreshing the Supabase dashboard.

4. Tables don't appear in the Table Editor
   - Refresh your browser
   - Go to Table Editor and click "Refresh"

5. "relation "public.users" does not exist"
   - This could happen if parts of the script are run out of order
   - Always run the ENTIRE script at once, not in pieces
   - The script should now be more resilient to this error

If all else fails, try creating a brand new Supabase project and running this script again.
*/ 