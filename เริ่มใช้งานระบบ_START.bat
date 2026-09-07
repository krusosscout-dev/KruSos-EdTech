@echo off
chcp 65001 > nul
title ระบบของครูซอส - Real-time Gamified Score Tracker
color 0b
echo =====================================================================
echo       🎯 ระบบของครูซอส (Real-time Score Tracker TS005)
echo       โรงเรียนวัดบางปูน - พัฒนาสื่อการเรียนรู้ 2569
echo =====================================================================
echo.
echo กำลังเริ่มต้นระบบเซิร์ฟเวอร์...
echo.
node server/index.js
pause
