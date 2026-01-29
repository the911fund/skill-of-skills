# N8N Workflow Scheduling Fix

## Issue
The 1-hour workflow scheduling changes are not taking effect properly.

## Root Cause
N8N cron schedules need proper configuration in the workflow nodes.

## Fix Steps

### 1. Import the Fixed README Generator Workflow
- Use the new `07-readme-generator-fixed.json` which includes:
  - Proper cron schedule node
  - Hourly trigger: `0 */1 * * *` (every hour on the hour)
  - GitHub auto-push functionality

### 2. Verify N8N Cron Configuration
In N8N interface (http://localhost:5679):

1. **Check Schedule Node Settings:**
   ```json
   {
     "rule": {
       "interval": [
         {
           "field": "hours", 
           "triggerAtHour": 1
         }
       ]
     }
   }
   ```

2. **Alternative: Use Standard Cron Expression:**
   ```
   0 */1 * * *  // Every hour
   0 0 */6 * *  // Every 6 hours  
   0 0 * * *    // Daily at midnight
   ```

### 3. Enable Workflow
- Ensure workflow is **ACTIVE** (toggle switch ON)
- Check execution history for errors
- Verify workflow permissions

### 4. Environment Variables
Ensure these are set in N8N:
```bash
GITHUB_TOKEN=<your_github_token>
GITHUB_ORG=the911fund
GITHUB_REPO=skill-of-skills
```

### 5. Manual Test
Test the workflow manually first:
```bash
curl -X POST http://localhost:5679/webhook/generate-readme
```

## Validation
✅ Check N8N execution log every hour
✅ Verify GitHub commits appear automatically
✅ Confirm WebUI updates reflect latest data