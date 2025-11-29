#!/bin/bash

# Auto compile thesis script (using latexmk, automatically detects compilation rounds)
# Usage: ./compile-auto.sh

echo "=========================================="
echo "开始智能编译论文..."
echo "=========================================="
echo ""

# 更新 PATH
eval "$(/usr/libexec/path_helper)"

# 进入论文目录
cd "$(dirname "$0")"

# 检查主文件是否存在
if [ ! -f "master_pang.tex" ]; then
    echo "错误：找不到 master_pang.tex 文件"
    exit 1
fi

# 使用 latexmk 自动编译（会自动处理所有必要的编译步骤）
echo "正在编译（latexmk 会自动处理所有步骤）..."
latexmk -xelatex -interaction=nonstopmode master_pang.tex

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ 编译成功！"
    echo "=========================================="
    echo ""
    
    if [ -f "master_pang.pdf" ]; then
        PDF_SIZE=$(ls -lh master_pang.pdf | awk '{print $5}')
        echo "生成的 PDF 文件：master_pang.pdf"
        echo "文件大小：$PDF_SIZE"
        echo ""
        echo "是否打开 PDF？(y/n)"
        read -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open master_pang.pdf
        fi
    fi
    
    # 编译成功后自动清理临时文件（符合 Overleaf 使用习惯）
    echo ""
    echo "正在清理临时文件..."
    rm -f *.aux *.bbl *.blg *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk *.synctex.gz *.xdv
    echo "✓ 临时文件已清理"
else
    echo ""
    echo "❌ 编译失败！请检查错误信息。"
    exit 1
fi

