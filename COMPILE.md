# Thesis Compilation Guide

## 🚀 One-Click Compilation (Recommended)

### Auto Compile Script

```bash
./compile-auto.sh
```

**Features:**
- Automatically detects required compilation rounds
- Automatically processes bibliography
- Automatically updates cross-references
- **Automatically cleans temporary files after successful compilation** (Overleaf-style)
- Only need to run once

**What it does:**
1. Compiles the thesis using `latexmk` (handles all necessary compilation rounds)
2. Generates `master_pang.pdf`
3. **Automatically removes temporary files** (`.aux`, `.bbl`, `.blg`, `.log`, `.out`, `.toc`, `.lof`, `.lot`, `.fls`, `.fdb_latexmk`, `.synctex.gz`, `.xdv`)
4. Optionally opens the PDF

> **Note:** Temporary files are only cleaned when compilation succeeds. If compilation fails, temporary files are preserved for debugging.

## 📝 Manual Compilation (Not Recommended)

If you need to compile manually, run in order:

```bash
# 1. First compilation
xelatex master_pang.tex

# 2. Process bibliography
bibtex master_pang

# 3. Second compilation (update references)
xelatex master_pang.tex

# 4. Third compilation (final confirmation)
xelatex master_pang.tex
```

## 🧹 Clean Temporary Files (Optional)

The auto compile script automatically cleans temporary files. If you need to clean manually:

```bash
./clean.sh
```

## 💡 Usage Tips

1. **After each modification**: Just run `./compile-auto.sh` - it handles everything automatically
2. **View PDF**: Script will ask if you want to open PDF automatically
3. **Clean workspace**: Temporary files are automatically cleaned after successful compilation (like Overleaf)

## ⚠️ Notes

- Make sure MacTeX-2025 (full version) is installed
- If compilation fails, check error messages
- Bibliography file: `ref_paper.bib`
- Main file: `master_pang.tex`

