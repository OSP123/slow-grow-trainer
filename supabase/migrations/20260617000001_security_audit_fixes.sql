-- 1. Prevent Privilege Escalation on profiles table
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger AS $$
BEGIN
  -- Allow admins or service role to change these fields freely
  IF auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  -- For regular users, ensure restricted fields aren't changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    NEW.payment_status := OLD.payment_status;
  END IF;
  IF NEW.campaign_status IS DISTINCT FROM OLD.campaign_status THEN
    NEW.campaign_status := OLD.campaign_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 2. Secure unit_points table
DROP POLICY IF EXISTS "Authenticated users manage unit points" ON public.unit_points;
CREATE POLICY "Admins manage unit points" ON public.unit_points
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Secure Storage Buckets Upload Paths
DROP POLICY IF EXISTS "Allow authenticated uploads to hobby photos" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to hobby photos" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'hobby_photos' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. Add Missing DELETE Policies
CREATE POLICY "Admins can delete matchups" ON public.matchups
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can delete own milestones" ON public.hobby_milestones
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.campaign_votes
    FOR DELETE USING (auth.uid() = voter_id);

CREATE POLICY "Allow users to delete own avatars" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Allow users to delete own hobby photos" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'hobby_photos' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5. Prevent Matchup Column Tampering
CREATE OR REPLACE FUNCTION public.enforce_matchup_update()
RETURNS trigger AS $$
BEGIN
  IF auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = NEW.p1_id THEN
    -- P1 can only modify p1_score, p1_lore
    NEW.p2_score := OLD.p2_score;
    NEW.p2_lore := OLD.p2_lore;
  ELSIF auth.uid() = NEW.p2_id THEN
    -- P2 can only modify p2_score, p2_lore
    NEW.p1_score := OLD.p1_score;
    NEW.p1_lore := OLD.p1_lore;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_matchup_update ON public.matchups;
CREATE TRIGGER on_matchup_update
  BEFORE UPDATE ON public.matchups
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_matchup_update();
