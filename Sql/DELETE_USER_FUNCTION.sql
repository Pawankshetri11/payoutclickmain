-- Create a secure function to delete users (admin only)
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  is_target_admin BOOLEAN;
BEGIN
  -- Check if requesting user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN json_build_object('error', 'Admin privileges required');
  END IF;
  
  -- Check if target user is admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = target_user_id AND role = 'admin'
  ) INTO is_target_admin;
  
  IF is_target_admin THEN
    RETURN json_build_object('error', 'Cannot delete admin users');
  END IF;
  
  -- Delete from profiles (cascade will handle related records)
  DELETE FROM profiles WHERE user_id = target_user_id;
  
  -- Note: Deleting from auth.users requires service role
  -- This will be handled by the edge function fallback
  
  RETURN json_build_object('success', true, 'message', 'User deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
