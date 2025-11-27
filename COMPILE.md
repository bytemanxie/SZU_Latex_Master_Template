# Thesis Compilation Guide

## 🚀 One-Click Compilation (Recommended)

### Method 1: Auto Compile Script (Easiest)

```bash
./compile-auto.sh
```

**Advantages:**
- Automatically detects required compilation rounds
- Automatically processes bibliography
- Automatically updates cross-references
- Only need to run once

### Method 2: Standard Compile Script

```bash
./compile.sh
```

**Description:**
- Automatically executes all compilation steps (xelatex → bibtex → xelatex → xelatex)
- Shows compilation progress
- Optionally opens PDF after compilation

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

## 🧹 Clean Temporary Files

Compilation generates many temporary files (.aux, .log, .bbl, etc.), run:

```bash
./clean.sh
```

## 💡 Usage Tips

1. **After each modification**: Just run `./compile-auto.sh`
2. **View PDF**: Script will ask if you want to open PDF automatically
3. **Clean files**: Run clean script before committing to keep directory tidy

## ⚠️ Notes

- Make sure MacTeX-2025 (full version) is installed
- If compilation fails, check error messages
- Bibliography file: `ref_paper.bib`
- Main file: `master_pang.tex`

