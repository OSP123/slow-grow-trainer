import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    console.log("Signing up test user...");
    const { data, error } = await supabase.auth.signUp({
        email: 'e2e_test_user@example.com',
        password: 'Password123!',
    });
    
    if (error) {
        console.error("Signup error:", error.message);
    } else {
        console.log("Test user created or already exists.", data.user?.id);
    }
}
createTestUser();
