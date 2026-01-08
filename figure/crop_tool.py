#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
论文配图裁剪工具 - 简化版
========================
用法:
    python crop_tool.py <图片> [选项]

示例:
    python crop_tool.py image.png --info          # 查看信息
    python crop_tool.py image.png -w 800          # 缩放到宽度800
    python crop_tool.py image.png -c 100,100,500,400   # 裁剪区域
"""

import argparse
import os
from PIL import Image


def main():
    parser = argparse.ArgumentParser(description='论文配图裁剪工具')
    parser.add_argument('input', help='输入图片')
    parser.add_argument('-o', '--output', help='输出路径')
    parser.add_argument('-w', '--width', type=int, help='目标宽度')
    parser.add_argument('-c', '--crop', help='裁剪区域: left,top,right,bottom')
    parser.add_argument('--info', action='store_true', help='仅显示信息')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"❌ 找不到: {args.input}")
        return
    
    img = Image.open(args.input)
    file_kb = os.path.getsize(args.input) / 1024
    
    print(f"\n📷 {args.input}")
    print(f"   尺寸: {img.size[0]} × {img.size[1]}  |  {file_kb:.1f} KB")
    
    if args.info:
        return
    
    # 裁剪
    if args.crop:
        box = tuple(map(int, args.crop.split(',')))
        img = img.crop(box)
        print(f"✂️  裁剪后: {img.size[0]} × {img.size[1]}")
    
    # 缩放
    if args.width:
        ratio = args.width / img.size[0]
        new_size = (args.width, int(img.size[1] * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        print(f"🔄 缩放后: {img.size[0]} × {img.size[1]}")
    
    # 保存
    output = args.output or args.input.replace('.png', '_out.png')
    img.save(output, optimize=True, quality=95)
    new_kb = os.path.getsize(output) / 1024
    print(f"✅ 保存: {output}  ({new_kb:.1f} KB)")


if __name__ == '__main__':
    main()
