# How to Package This Project

## Option 1: ZIP File (Recommended)

### Windows
```bash
# Using PowerShell
Compress-Archive -Path wallet_def -DestinationPath wallet_virtual.zip
```

### macOS/Linux
```bash
zip -r wallet_virtual.zip wallet_def/ -x "*/node_modules/*" "*/.env" "*/dist/*"
```

## Option 2: Git Repository

```bash
cd wallet_def
git init
git add .
git commit -m "Initial commit: Virtual Wallet with Marketplace"
```

Then push to GitHub/GitLab.

## Files to Exclude from Package

The following are auto-generated and should NOT be included:
- `node_modules/` (backend and frontend)
- `dist/` (compiled code)
- `.env` (secrets—use .env.example instead)
- `backend/prisma/migrations/*/` (except .gitkeep)

## What to Include

✅ **Source Code**:
- All `.ts`, `.tsx`, `.js`, `.json` files
- All config files (tsconfig, vite, tailwind, etc.)
- `prisma/schema.prisma` and `prisma/seed.ts`

✅ **Documentation**:
- README.md
- QUICKSTART.md
- ARCHITECTURE.md
- PROJECT_SUMMARY.md

✅ **Configuration**:
- `.env.example` (NOT .env)
- docker-compose.yml
- .gitignore

✅ **Tests**:
- All files in `tests/` folder

## Final Checklist

Before packaging:
- [ ] Remove `backend/node_modules/`
- [ ] Remove `frontend/node_modules/`
- [ ] Remove `backend/dist/`
- [ ] Remove `backend/.env` (keep `.env.example`)
- [ ] Verify README.md has correct instructions
- [ ] Test that all source files are present

## Package Size

- **With node_modules**: ~400MB
- **Without node_modules**: ~2-5MB (recommended)

## Recipient Instructions

Tell the recipient:

1. Extract ZIP file
2. Read `QUICKSTART.md`
3. Run:
   ```bash
   docker-compose up -d
   cd backend && npm install && npm run migrate && npm run seed && npm run dev
   # New terminal:
   cd frontend && npm install && npm run dev
   ```

---

That's it! Your project is ready to share. 🎉
