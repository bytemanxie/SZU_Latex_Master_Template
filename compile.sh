#!/bin/bash

# Compile thesis script
# Usage: ./compile.sh

echo "=========================================="
echo "开始编译论文..."
echo "=========================================="
echo ""

# 更新 PATH（确保能找到 xelatex）
eval "$(/usr/libexec/path_helper)"

# 进入论文目录
cd "$(dirname "$0")"

# 检查主文件是否存在
if [ ! -f "master_pang.tex" ]; then
    echo "错误：找不到 master_pang.tex 文件"
    exit 1
fi

# 第一次编译
echo "步骤 1/4: 第一次编译 XeLaTeX..."
xelatex -interaction=nonstopmode master_pang.tex > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ 编译失败！请检查错误信息："
    xelatex -interaction=nonstopmode master_pang.tex 2>&1 | tail -20
    exit 1
fi
echo "✓ 第一次编译完成"

# 处理参考文献
echo "步骤 2/4: 处理参考文献..."
if [ -f "master_pang.aux" ]; then
    bibtex master_pang > /dev/null 2>&1
    echo "✓ 参考文献处理完成"
else
    echo "⚠ 未找到 .aux 文件，跳过参考文献处理"
fi

# 第二次编译
echo "步骤 3/4: 第二次编译 XeLaTeX（更新引用）..."
xelatex -interaction=nonstopmode master_pang.tex > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ 编译失败！"
    exit 1
fi
echo "✓ 第二次编译完成"

# 第三次编译（确保所有交叉引用正确）
echo "步骤 4/4: 第三次编译 XeLaTeX（最终确认）..."
xelatex -interaction=nonstopmode master_pang.tex > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ 编译失败！"
    exit 1
fi
echo "✓ 第三次编译完成"

echo ""
echo "=========================================="
echo "✅ 编译成功！"
echo "=========================================="
echo ""
echo "生成的 PDF 文件：master_pang.pdf"

# 检查文件是否存在并显示大小
if [ -f "master_pang.pdf" ]; then
    PDF_SIZE=$(ls -lh master_pang.pdf | awk '{print $5}')
    echo "文件大小：$PDF_SIZE"
    echo ""
    echo "是否打开 PDF？(y/n)"
    read -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open master_pang.pdf
    fi
fi

