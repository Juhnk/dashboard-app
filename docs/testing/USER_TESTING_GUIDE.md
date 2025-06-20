# User Testing Guide

## Quick Setup & Login

### 1. Start the Development Environment

If you have Docker installed:
```bash
# From the project root
npm run dev
```

If you need to start the database separately:
```bash
# Start PostgreSQL and Redis
npm run docker:dev

# In another terminal, start the web app
cd apps/web
npm run dev
```

### 2. Create Test User

```bash
# From the apps/web directory
node scripts/create-test-user.js
```

### 3. Test Login Credentials

Access the app at `http://localhost:3000` and sign in with:

- **Email:** `test@example.com`
- **Password:** `password123`
- **Role:** Admin (full access)

## Testing Google Sheets Integration

### Prerequisites

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Sheets API
   - Create OAuth 2.0 credentials (Web application)
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

2. **Environment Configuration:**
   Update `.env.local` with your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID="your-actual-google-client-id"
   GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
   ```

### Test Workflow

1. **Sign in with Google:**
   - After logging in with test credentials
   - Go to account settings or data sources
   - Connect your Google account for Sheets access

2. **Create a Test Google Sheet:**
   - Create a new Google Sheet with sample data
   - Add headers in the first row (e.g., "Name", "Value", "Date")
   - Add some test data in the following rows
   - Make sure the sheet is accessible to your Google account

3. **Connect Google Sheets:**
   - In the dashboard, go to "Data Sources"
   - Click "Add Data Source"
   - Select "Google Sheets"
   - Paste your Google Sheets URL
   - Test the connection
   - Configure the sheet name and range if needed

4. **Create Widgets:**
   - Go to your dashboard
   - Add a new widget
   - Select chart type (line, bar, pie, etc.)
   - Choose your Google Sheets data source
   - Configure the widget to use your data
   - Save and view the results

## Testing Features

### Dashboard Features
- ✅ Create/edit/delete dashboards
- ✅ Add/remove dashboard tabs
- ✅ Drag & drop widgets
- ✅ Real-time data updates

### Data Source Features
- ✅ Google Sheets connection
- ✅ CSV upload (if implemented)
- ✅ Data schema detection
- ✅ Connection testing
- ✅ Data preview

### Widget Features
- ✅ Multiple chart types
- ✅ Data binding
- ✅ Real-time updates
- ✅ Responsive design

### Authentication Features
- ✅ Email/password login
- ✅ Google OAuth integration
- ✅ Role-based access
- ✅ Session management

## Troubleshooting

### Database Issues
```bash
# Reset the database
npm run db:reset

# Run migrations
npm run db:migrate

# Recreate test user
node scripts/create-test-user.js
```

### Google Sheets Issues
- Verify OAuth credentials are correct
- Check that Google Sheets API is enabled
- Ensure the redirect URI is properly configured
- Make sure the test sheet is accessible

### Common Errors
- **"Unauthorized"**: Check if you're logged in and have valid session
- **"Failed to connect to Google Sheets"**: Verify OAuth setup and permissions
- **"Database connection failed"**: Ensure PostgreSQL is running
- **"Invalid source type"**: Make sure you're using a supported data source type

## Sample Data

Here's some sample data you can use in your test Google Sheet:

| Product | Revenue | Date | Category |
|---------|---------|------|----------|
| Widget A | 1500 | 2024-01-01 | Electronics |
| Widget B | 2300 | 2024-01-02 | Electronics |
| Service X | 890 | 2024-01-03 | Services |
| Widget C | 3200 | 2024-01-04 | Electronics |
| Service Y | 1200 | 2024-01-05 | Services |

## Support

If you encounter issues:
1. Check the console logs in your browser
2. Check the terminal output from the development server
3. Verify all environment variables are set correctly
4. Ensure all required services (PostgreSQL, Redis) are running