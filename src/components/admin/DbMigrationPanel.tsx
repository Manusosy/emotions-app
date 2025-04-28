import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';

interface MigrationStatus {
  consultation_fee_exists: boolean;
  checked_at: string;
}

export default function DbMigrationPanel() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const [user, setUser] = useState<{ id: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [checkStatus, setCheckStatus] = useState<MigrationStatus | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);

  // Get the current user
  useEffect(() => {
    async function getUserData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();
      
      setUser({ id: authUser.id, role: data?.role });
    }
    
    getUserData();
  }, [supabase]);

  // Check if the user is an admin
  const isAdmin = user?.role === 'admin';

  // Function to check migration status
  const checkMigrationStatus = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setCheckLoading(true);
    try {
      // Check if the column exists in the database directly
      const { data, error } = await supabase.rpc('check_column_exists', {
        table_name: 'ambassador_profiles',
        column_name: 'consultation_fee'
      });
      
      if (error) {
        console.error("Error checking column existence:", error);
        
        // Alternative direct check if RPC fails
        const { data: columnsData, error: columnsError } = await supabase.from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'ambassador_profiles')
          .eq('column_name', 'consultation_fee');
          
        if (columnsError) {
          throw new Error(`Failed to check column status: ${columnsError.message}`);
        }
        
        const columnExists = columnsData && columnsData.length > 0;
        
        setCheckStatus({
          consultation_fee_exists: columnExists,
          checked_at: new Date().toISOString()
        });
        
        if (columnExists) {
          toast.success('consultation_fee column exists in ambassador_profiles table');
        } else {
          toast.warning('consultation_fee column is missing from ambassador_profiles table');
        }
      } else {
        setCheckStatus({
          consultation_fee_exists: !!data,
          checked_at: new Date().toISOString()
        });
        
        if (data) {
          toast.success('consultation_fee column exists in ambassador_profiles table');
        } else {
          toast.warning('consultation_fee column is missing from ambassador_profiles table');
        }
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      toast.error('Failed to check migration status');
    } finally {
      setCheckLoading(false);
    }
  };

  // Function to add the column directly via SQL
  const addColumnDirectly = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setLoading(true);
    setStatus('loading');
    setMessage('Adding consultation_fee column...');

    try {
      // Try to add the column directly using SQL
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE IF EXISTS public.ambassador_profiles 
          ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL DEFAULT 0;
        `
      });
      
      if (error) {
        console.error("SQL execution error:", error);
        
        // Try alternative approach with add_column_to_table function
        const { error: addError } = await supabase.rpc('add_column_to_table', {
          table_name: 'ambassador_profiles',
          column_name: 'consultation_fee',
          column_type: 'DECIMAL',
          default_value: '0'
        });
        
        if (addError) {
          throw new Error(`Failed to add column: ${addError.message}`);
        }
      }
      
      setStatus('success');
      setMessage('Successfully added consultation_fee column to ambassador_profiles table');
      toast.success('Column added successfully');
      
      // Refresh status
      await checkMigrationStatus();
    } catch (error: any) {
      console.error('Error adding column:', error);
      setStatus('error');
      setMessage(`Failed to add column: ${error.message || 'Unknown error'}`);
      toast.error(`Failed to add column: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to run the migration
  const runMigration = async (action: string) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setLoading(true);
    setStatus('loading');
    setMessage('Running migration...');

    try {
      const response = await fetch('/api/admin/db-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      setStatus('success');
      setMessage(data.message || 'Migration completed successfully');
      toast.success('Migration completed successfully');
      
      // Refresh status after successful migration
      await checkMigrationStatus();
    } catch (error: any) {
      console.error('Migration error:', error);
      setStatus('error');
      setMessage(`Migration failed: ${error.message || 'Unknown error'}`);
      toast.error(`Migration failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything for non-admin users
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Database Migration Panel
        </CardTitle>
        <CardDescription>
          Run database migrations to add missing columns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status display */}
        {status !== 'idle' && (
          <Alert variant={status === 'loading' ? 'default' : status === 'success' ? 'default' : 'destructive'}>
            <div className="flex items-center gap-2">
              {status === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {status === 'error' && <XCircle className="h-4 w-4" />}
              <AlertTitle>
                {status === 'loading' ? 'Running Migration' : 
                 status === 'success' ? 'Migration Successful' : 'Migration Failed'}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">{message}</AlertDescription>
          </Alert>
        )}

        {/* Migration status */}
        <div className="rounded-md border p-4">
          <h3 className="text-sm font-medium mb-2">Migration Status</h3>
          
          {checkLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : checkStatus ? (
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                {checkStatus.consultation_fee_exists ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-amber-500" />}
                <span>
                  consultation_fee column: 
                  {checkStatus.consultation_fee_exists ? 
                    ' ✓ Present' : 
                    ' ✗ Missing'}
                </span>
              </li>
              <li className="text-xs text-muted-foreground mt-2">
                Last checked: {checkStatus.checked_at ? 
                  new Date(checkStatus.checked_at).toLocaleString() : 'Never'}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Check Status" to view current migration status</p>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={checkMigrationStatus}
            disabled={checkLoading}
          >
            {checkLoading ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Checking...
              </>
            ) : (
              <>Check Status</>
            )}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <div className="w-full space-y-2">
          <Button
            className="w-full"
            onClick={() => runMigration('add_consultation_fee')}
            disabled={loading || (checkStatus?.consultation_fee_exists || false)}
          >
            {loading && status === 'loading' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Adding consultation_fee column (API)...
              </>
            ) : checkStatus?.consultation_fee_exists ? (
              <>consultation_fee column already exists</>
            ) : (
              <>Add consultation_fee column via API</>
            )}
          </Button>
          
          <Button
            className="w-full"
            variant="outline"
            onClick={addColumnDirectly}
            disabled={loading || (checkStatus?.consultation_fee_exists || false)}
          >
            {loading && status === 'loading' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Adding column directly...
              </>
            ) : (
              <>Add column directly (SQL)</>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          These operations might require a page refresh to see the changes take effect.
        </p>
      </CardFooter>
    </Card>
  );
} 