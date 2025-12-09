# Setup Instructions for 11 22 Pádel Club

## 1. Environment Variables
Create a file named `.env.local` in the `padel-app` directory with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## 2. Database Setup
Run the SQL script located at `supabase_schema.sql` (in the parent directory) in your Supabase SQL Editor.
This will:
- Create `profiles`, `nfc_cards`, `transactions` tables.
- Enable RLS policies (Critical for security).
- Create helper functions.

## 3. NFC Admin Panel
To use the NFC features:
- Open the app on an Android device with Chrome.
- Use the endpoint `/` (Home) which currently mounts the Admin Panel for demonstration.
- Ensure you have configured SSL (https) if deploying, as Web NFC requires a secure context (localhost works for dev).
