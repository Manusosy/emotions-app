# PostgreSQL Policy Fix

## Issue Description

We encountered an issue with PostgreSQL policy creation in our migrations. PostgreSQL does not support the `IF NOT EXISTS` clause for policies, which was causing SQL syntax errors when trying to run migrations.

Error example:
```
ERROR: syntax error at or near "IF"
LINE X: CREATE POLICY IF NOT EXISTS "Policy name" ON table_name ...
```

## Fix Details

The fix involves:

1. A new migration file `20240530000000_fix_policy_syntax.sql` that:
   - Drops any potentially problematic policies safely (with error handling)
   - Recreates them without using the `IF NOT EXISTS` clause
   - Grants proper permissions

## Best Practices for Future Migrations

When creating PostgreSQL policies:

1. **DO NOT** use the `IF NOT EXISTS` clause with `CREATE POLICY` as it's not supported
2. **DO** use this pattern instead:

```sql
-- Drop existing policy first
DROP POLICY IF EXISTS "Your Policy Name" ON your_table;

-- Create the policy (without IF NOT EXISTS)
CREATE POLICY "Your Policy Name" 
    ON your_table 
    FOR SELECT
    USING (your_condition);
```

For more complex migrations, use a `DO` block with error handling:

```sql
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Your Policy Name" ON your_table;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;
END $$;

-- Then create the policy
CREATE POLICY "Your Policy Name" 
    ON your_table 
    FOR SELECT
    USING (your_condition);
```

## Applying the Fix

You can apply the fix by running:

```bash
node run_migration.js
```

Or manually with:

```bash
supabase db reset
``` 