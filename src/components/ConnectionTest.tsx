import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../supabase-test';
import { Button } from './ui/button';
import { retryOperation } from '../utils/network';
import { supabase } from '../integrations/supabase/client';
import { Spinner } from './ui/spinner';
import { SUPABASE_PUBLISHABLE_KEY } from '../integrations/supabase/client';

const ConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setDiagnostics(null);
    setAuthStatus('unknown');
    
    try {
      // Check API key format first
      const isValidFormat = typeof SUPABASE_PUBLISHABLE_KEY === 'string' && 
        SUPABASE_PUBLISHABLE_KEY.length > 50 && 
        SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ');
      
      if (!isValidFormat) {
        setError('API key format is invalid');
        setAuthStatus('invalid');
        setIsLoading(false);
        return;
      }
      
      // Gather network information
      const networkInfo = {
        online: navigator.onLine,
        connection: 'connection' in navigator ? 
          // @ts-ignore - some browsers may not have this
          (navigator as any).connection?.effectiveType || 'unknown' : 'unknown',
        userAgent: navigator.userAgent
      };
      
      // Check basic fetch to the Supabase domain
      let domainReachable = false;
      try {
        const domainCheck = await fetch('https://ekpiqiatfwozmepkgbbe.supabase.co/robots.txt', {
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors',
          headers: { 'Cache-Control': 'no-cache' }
        });
        domainReachable = true;
      } catch (err) {
        console.error('Domain fetch error:', err);
      }
      
      // Try running the actual connection test with retries
      const connectionResult = await retryOperation(
        () => testSupabaseConnection(), 
        2, // 2 retries
        1000 // 1 second delay between retries
      );
      
      console.log('Connection test result:', connectionResult);
      
      // Try a direct simple query as additional test
      let directQueryResult = null;
      let directQueryTable = 'users';
      try {
        // Try multiple tables in case one doesn't exist
        let tables = ['users', 'profiles', 'patient_profiles'];
        let succeeded = false;
        
        for (let tableName of tables) {
          try {
            const { data, error } = await supabase.from(tableName).select('id', { count: 'exact', head: true });
            
            if (!error) {
              directQueryResult = { data, tableName };
              directQueryTable = tableName;
              succeeded = true;
              break;
            }
          } catch (e) {
            console.log(`Error querying ${tableName}:`, e);
          }
        }
        
        if (!succeeded) {
          // Try one last general query
          const { error } = await supabase.from('users').select('count', { head: true });
          directQueryResult = { error };
        }
        
        // Check for auth errors
        if (directQueryResult?.error && (
          directQueryResult.error.message.includes('API key') || 
          directQueryResult.error.message.includes('api key') ||
          directQueryResult.error.message.includes('auth') ||
          directQueryResult.error.code === '401' ||
          directQueryResult.error.code === '403'
        )) {
          setAuthStatus('invalid');
        } else if (directQueryResult?.data || succeeded) {
          setAuthStatus('valid');
        }
      } catch (directErr) {
        console.error('Direct query error:', directErr);
        directQueryResult = { error: directErr };
      }
      
      // Set diagnostics
      setDiagnostics({
        networkInfo,
        domainReachable,
        directQueryResult,
        directQueryTable,
        apiKeyLength: SUPABASE_PUBLISHABLE_KEY.length,
        apiKeyPrefix: SUPABASE_PUBLISHABLE_KEY.substring(0, 10) + '...'
      });
      
      if (connectionResult.success) {
        setResult(connectionResult.data);
      } else {
        // Check if it's an auth error
        if (connectionResult.error && 
            typeof connectionResult.error === 'string' && 
            (connectionResult.error.includes('API key') || 
             connectionResult.error.includes('api key') ||
             connectionResult.error.includes('auth') ||
             connectionResult.error.includes('Authentication'))) {
          setAuthStatus('invalid');
        }
        
        setError(typeof connectionResult.error === 'object' && connectionResult.error?.message 
          ? connectionResult.error.message 
          : String(connectionResult.error || 'Connection failed'));
      }
    } catch (err) {
      console.error('Error running connection test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-run the test on mount
  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Supabase Connection Test</h3>
      
      {isLoading && (
        <div className="text-gray-500 mb-2 flex items-center">
          <Spinner className="mr-2 h-4 w-4" />
          Testing connection...
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mb-2">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="text-green-500 mb-2">
          Connected successfully!
        </div>
      )}
      
      {diagnostics && (
        <div className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">
          <div>Network: {diagnostics.networkInfo.online ? 'Online' : 'Offline'}</div>
          <div>Connection: {diagnostics.networkInfo.connection}</div>
          <div>Domain reachable: {diagnostics.domainReachable ? 'Yes' : 'No'}</div>
          <div>API key: {authStatus === 'valid' 
            ? '✓ Valid' 
            : authStatus === 'invalid' 
              ? '✗ Invalid' 
              : '? Unknown'}</div>
          {diagnostics.directQueryResult?.error && (
            <div>Direct query error: {diagnostics.directQueryResult.error.message || 'Unknown error'}</div>
          )}
        </div>
      )}
      
      <Button 
        onClick={runTest} 
        disabled={isLoading}
        className="bg-blue-500 text-white hover:bg-blue-600"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </Button>
    </div>
  );
};

export default ConnectionTest; 