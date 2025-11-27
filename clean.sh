#!/bin/bash

# Clean LaTeX compilation temporary files

echo "Cleaning temporary files..."

cd "$(dirname "$0")"

# Remove temporary files
rm -f *.aux *.bbl *.blg *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk *.synctex.gz

echo "✓ Cleanup completed!"

