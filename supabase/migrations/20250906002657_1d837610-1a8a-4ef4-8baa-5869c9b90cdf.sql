-- Schedule the daily crypto updater function to run every day at midnight UTC
SELECT cron.schedule(
  'daily-crypto-value-update', 
  '0 0 * * *', -- Run at midnight UTC every day
  $$
  SELECT
    net.http_post(
        url:='https://bclxktsmvlhovnhquswq.supabase.co/functions/v1/daily-crypto-updater',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjbHhrdHNtdmxob3ZuaHF1c3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTI2MjksImV4cCI6MjA3MjQ4ODYyOX0.ww0CMJH2aQ37S8IgS-hHUoI23AQPj5qVADMD1WYndCA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Also schedule a security validation check every hour
SELECT cron.schedule(
  'hourly-security-check',
  '0 * * * *', -- Run every hour
  $$
  SELECT
    net.http_post(
        url:='https://bclxktsmvlhovnhquswq.supabase.co/functions/v1/security-validator',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjbHhrdHNtdmxob3ZuaHF1c3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTI2MjksImV4cCI6MjA3MjQ4ODYyOX0.ww0CMJH2aQ37S8IgS-hHUoI23AQPj5qVADMD1WYndCA"}'::jsonb,
        body:='{"type": "scheduled_check"}'::jsonb
    ) as request_id;
  $$
);