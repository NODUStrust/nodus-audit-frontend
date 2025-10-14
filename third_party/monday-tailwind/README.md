# Monday - Tailwind asset scaffold (cleaned)

This folder contains scaffolding and instructions to import and clean the large "Monday - full stack" asset bundle you provided.

Important: I do not have direct access to `c:\Users\the boss\Downloads` from this environment. Instead this scaffold includes a PowerShell script you can run locally to copy, deduplicate, normalize, and zip the cleaned result into the repository.

How to use
1. Place the original folder (for example `"c:\Users\the boss\Downloads\Monday - full stack newest complete with tailwinds_files"`) somewhere on your machine.
2. From the repository root run the script below (PowerShell):

```powershell
cd "c:\Users\the boss\New folder\nodus-audit-frontend"
.
\scripts\clean_and_zip_monday.ps1 -SourcePath "C:\Users\the boss\Downloads\Monday - full stack newest complete with tailwinds_files" -DestRoot .\third_party\monday-tailwind
```

What the script does
- Scans `-SourcePath` recursively and groups files into `css/`, `images/`, `html/`, and `other/` under the provided `-DestRoot`.
- Normalizes filenames (replaces spaces with hyphens, trims invalid characters).
- Deduplicates files by SHA256 hash; keeps one copy and records removals in `CHANGELOG_CLEANUP.md`.
- Produces a zip archive: `monday-tailwind-scaffold-YYYYMMDD.zip` at the repo root.

If you prefer that I import the files directly into the repo, you can copy the cleaned output into this folder and tell me to commit; otherwise run the script and it will produce the ZIP for distribution.

If anything in this process should differ (different folder name, keep nested directory structure, etc.), tell me which preference and I will adjust the script.
