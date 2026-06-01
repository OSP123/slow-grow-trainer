-- Add payment_status tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status boolean DEFAULT false;

-- Allow admins to update the payment status of any profile
CREATE POLICY "Admins can update payment statuses" ON public.profiles
    FOR UPDATE USING (
      auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );
