import { supabase } from '@/integrations/supabase/client';

/**
 * Service for database management operations
 */
export const dbHelpers = {
  /**
   * Create a table if it doesn't exist
   */
  async createTableIfNotExists(tableName: string, tableDefinition: string): Promise<boolean> {
    try {
      // First we'll check if the RPC function exists
      await this.ensureRpcFunctions();
      
      // Then call the function
      const { data, error } = await supabase.rpc('create_table_if_not_exists', {
        table_name: tableName,
        table_definition: tableDefinition
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      return false;
    }
  },

  /**
   * Add a column to a table if it doesn't exist
   */
  async addColumnIfNotExists(
    tableName: string, 
    columnName: string, 
    columnDefinition: string
  ): Promise<boolean> {
    try {
      // First we'll check if the RPC function exists
      await this.ensureRpcFunctions();
      
      // Then call the function
      const { data, error } = await supabase.rpc('add_column_if_not_exists', {
        table_name: tableName,
        column_name: columnName,
        column_definition: columnDefinition
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error adding column ${columnName} to ${tableName}:`, error);
      return false;
    }
  },

  /**
   * Create an RPC function if it doesn't exist
   */
  async createRpcIfNotExists(
    functionName: string, 
    functionDefinition: string
  ): Promise<boolean> {
    try {
      // First we'll check if the RPC function exists
      await this.ensureRpcFunctions();
      
      // Then call the function
      const { data, error } = await supabase.rpc('create_rpc_if_not_exists', {
        function_name: functionName,
        function_definition: functionDefinition
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error creating RPC function ${functionName}:`, error);
      return false;
    }
  },

  /**
   * Ensure the core database management RPC functions exist
   */
  async ensureRpcFunctions(): Promise<void> {
    try {
      // First, let's define the SQL to check if our helper function exists
      let checkData = false;
      try {
        const { data, error } = await supabase.rpc('function_exists', {
          function_name: 'create_table_if_not_exists'
        });
        if (!error && data) {
          checkData = data;
        }
      } catch (checkError) {
        console.log('Function exists check failed:', checkError);
        checkData = false;
      }

      // If the function doesn't exist or we couldn't check, we need to create our helper functions
      if (!checkData) {
        console.log('Creating database helper functions...');
        
        // Create the function_exists helper
        await supabase.rpc('create_function_exists_helper');
        
        // Create the create_table_if_not_exists function
        await supabase.rpc('create_table_management_functions');
      }
    } catch (error) {
      console.error('Error ensuring RPC functions:', error);
      
      // As a fallback, we'll execute the raw SQL directly
      try {
        // Create function_exists helper
        await supabase.from('_postgrest_function_creation').insert({
          sql: `
          CREATE OR REPLACE FUNCTION function_exists(function_name TEXT)
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
              exists_val BOOLEAN;
          BEGIN
              SELECT EXISTS(
                  SELECT 1
                  FROM pg_proc
                  WHERE proname = function_name
              ) INTO exists_val;
              
              RETURN exists_val;
          END;
          $$;
          `
        });
        
        // Create table management functions
        await supabase.from('_postgrest_function_creation').insert({
          sql: `
          CREATE OR REPLACE FUNCTION create_table_if_not_exists(
              table_name TEXT, 
              table_definition TEXT
          )
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
              table_exists BOOLEAN;
          BEGIN
              SELECT EXISTS(
                  SELECT 1
                  FROM information_schema.tables
                  WHERE table_schema = 'public'
                  AND table_name = create_table_if_not_exists.table_name
              ) INTO table_exists;
              
              IF NOT table_exists THEN
                  EXECUTE format('CREATE TABLE IF NOT EXISTS %I (%s)', 
                      create_table_if_not_exists.table_name, 
                      create_table_if_not_exists.table_definition);
                  RETURN TRUE;
              END IF;
              
              RETURN FALSE;
          END;
          $$;
          
          CREATE OR REPLACE FUNCTION add_column_if_not_exists(
              table_name TEXT, 
              column_name TEXT, 
              column_definition TEXT
          )
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
              column_exists BOOLEAN;
          BEGIN
              SELECT EXISTS(
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = add_column_if_not_exists.table_name
                  AND column_name = add_column_if_not_exists.column_name
              ) INTO column_exists;
              
              IF NOT column_exists THEN
                  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s', 
                      add_column_if_not_exists.table_name, 
                      add_column_if_not_exists.column_name, 
                      add_column_if_not_exists.column_definition);
                  RETURN TRUE;
              END IF;
              
              RETURN FALSE;
          END;
          $$;
          
          CREATE OR REPLACE FUNCTION create_rpc_if_not_exists(
              function_name TEXT, 
              function_definition TEXT
          )
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
              func_exists BOOLEAN;
          BEGIN
              SELECT EXISTS(
                  SELECT 1
                  FROM pg_proc
                  WHERE proname = create_rpc_if_not_exists.function_name
              ) INTO func_exists;
              
              IF NOT func_exists THEN
                  EXECUTE format('CREATE OR REPLACE FUNCTION %I %s', 
                      create_rpc_if_not_exists.function_name, 
                      create_rpc_if_not_exists.function_definition);
                  RETURN TRUE;
              END IF;
              
              RETURN FALSE;
          END;
          $$;
          `
        });
        
      } catch (fallbackError) {
        console.error('Fallback RPC function creation failed:', fallbackError);
      }
    }
  }
};

export default dbHelpers; 