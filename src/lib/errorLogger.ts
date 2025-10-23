import { supabase } from '@/integrations/supabase/client';

interface ErrorLogData {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  page_url?: string;
  severity?: 'error' | 'warning' | 'critical';
}

export async function logError(errorData: ErrorLogData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await (supabase as any)
      .from('error_logs')
      .insert({
        error_type: errorData.error_type,
        error_message: errorData.error_message,
        stack_trace: errorData.stack_trace,
        user_id: user?.id || null,
        user_email: user?.email || null,
        page_url: errorData.page_url || window.location.href,
        severity: errorData.severity || 'error'
      });

    if (error) {
      console.error('Failed to log error:', error);
    }
  } catch (err) {
    console.error('Error logger failed:', err);
  }
}

// Setup global error handler
export function setupGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    logError({
      error_type: 'JavaScript Error',
      error_message: event.message,
      stack_trace: event.error?.stack,
      severity: 'error'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError({
      error_type: 'Unhandled Promise Rejection',
      error_message: event.reason?.message || String(event.reason),
      stack_trace: event.reason?.stack,
      severity: 'warning'
    });
  });
}
