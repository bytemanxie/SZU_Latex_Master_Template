#!/usr/bin/env python3
"""
生成数据增强效果示例图
基于原始图像生成 6 种增强效果：原始、水平翻转、旋转、亮度调整、对比度调整、高斯噪声
"""

import cv2
import numpy as np
from pathlib import Path

def main():
    # 读取原始图像
    input_path = Path(__file__).parent / "fig2-6b_processed.png"
    img = cv2.imread(str(input_path))
    
    if img is None:
        print(f"错误：无法读取图像 {input_path}")
        return
    
    print(f"成功读取图像: {input_path}, 尺寸: {img.shape}")
    
    # 输出目录
    output_dir = Path(__file__).parent
    
    # 1. 原始图像
    original_path = output_dir / "fig2-9a_original.png"
    cv2.imwrite(str(original_path), img)
    print(f"已保存: {original_path.name}")
    
    # 2. 水平翻转
    hflip = cv2.flip(img, 1)
    hflip_path = output_dir / "fig2-9b_hflip.png"
    cv2.imwrite(str(hflip_path), hflip)
    print(f"已保存: {hflip_path.name}")
    
    # 3. 旋转 15°
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, 15, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)
    rotate_path = output_dir / "fig2-9c_rotate.png"
    cv2.imwrite(str(rotate_path), rotated)
    print(f"已保存: {rotate_path.name}")
    
    # 4. 亮度调整 (增加 20%)
    brightness = cv2.convertScaleAbs(img, alpha=1.0, beta=30)
    brightness_path = output_dir / "fig2-9d_brightness.png"
    cv2.imwrite(str(brightness_path), brightness)
    print(f"已保存: {brightness_path.name}")
    
    # 5. 对比度调整 (增加 30%)
    contrast = cv2.convertScaleAbs(img, alpha=1.3, beta=0)
    contrast_path = output_dir / "fig2-9e_contrast.png"
    cv2.imwrite(str(contrast_path), contrast)
    print(f"已保存: {contrast_path.name}")
    
    # 6. 高斯噪声
    noise = np.random.normal(0, 15, img.shape).astype(np.float32)
    noisy = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    noise_path = output_dir / "fig2-9f_noise.png"
    cv2.imwrite(str(noise_path), noisy)
    print(f"已保存: {noise_path.name}")
    
    print("\n所有增强效果图生成完成！")

if __name__ == "__main__":
    main()
