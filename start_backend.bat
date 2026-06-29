@echo off
cd /d %~dp0backend
python -m pip install -r requirements.txt
set HELPDESK_ADMIN_KEY=campus-admin-123
python -m uvicorn app.main:app --reload
pause
