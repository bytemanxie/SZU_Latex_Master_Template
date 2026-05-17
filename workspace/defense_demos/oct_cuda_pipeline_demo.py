#!/usr/bin/env python3
"""
Runnable teaching demo for the CUDA OCT reconstruction chapter.

This script does not require an NVIDIA GPU. It mirrors the dataflow in
Process_Data.cu with NumPy so the core ideas are visible:

1. M x N raw interferogram matrix
2. background subtraction
3. K-linearization by natural cubic spline
4. Thomas vs PCR tridiagonal solvers
5. batched FFT
6. A-scan and B-scan visualization

Run:
    python3 workspace/defense_demos/oct_cuda_pipeline_demo.py
"""

from __future__ import annotations

import argparse
import math
import os
from pathlib import Path

import numpy as np


def thomas_solve(a: np.ndarray, b: np.ndarray, c: np.ndarray, d: np.ndarray) -> np.ndarray:
    """Serial tridiagonal solver: a[i]x[i-1] + b[i]x[i] + c[i]x[i+1] = d[i]."""
    n = len(b)
    ac = a.astype(float).copy()
    bc = b.astype(float).copy()
    cc = c.astype(float).copy()
    dc = d.astype(float).copy()

    for i in range(1, n):
        w = ac[i] / bc[i - 1]
        bc[i] -= w * cc[i - 1]
        dc[i] -= w * dc[i - 1]

    x = np.empty(n, dtype=float)
    x[-1] = dc[-1] / bc[-1]
    for i in range(n - 2, -1, -1):
        x[i] = (dc[i] - cc[i] * x[i + 1]) / bc[i]
    return x


def pcr_solve(a: np.ndarray, b: np.ndarray, c: np.ndarray, d: np.ndarray) -> np.ndarray:
    """
    Parallel Cyclic Reduction shown with vectorized NumPy.

    In CUDA, each row update below is handled by a thread. Each level uses a
    wider neighbor distance: 1, 2, 4, ..., until every row becomes independent.
    """
    n = len(b)
    aa = a.astype(float).copy()
    bb = b.astype(float).copy()
    cc = c.astype(float).copy()
    dd = d.astype(float).copy()

    levels = math.ceil(math.log2(n))
    rows = np.arange(n)
    for level in range(levels):
        offset = 1 << level
        left = rows - offset
        right = rows + offset
        has_left = left >= 0
        has_right = right < n

        old_a, old_b, old_c, old_d = aa.copy(), bb.copy(), cc.copy(), dd.copy()
        alpha = np.zeros(n, dtype=float)
        gamma = np.zeros(n, dtype=float)

        alpha[has_left] = old_a[has_left] / old_b[left[has_left]]
        gamma[has_right] = old_c[has_right] / old_b[right[has_right]]

        bb = old_b.copy()
        dd = old_d.copy()
        aa = np.zeros(n, dtype=float)
        cc = np.zeros(n, dtype=float)

        bb[has_left] -= alpha[has_left] * old_c[left[has_left]]
        dd[has_left] -= alpha[has_left] * old_d[left[has_left]]
        aa[has_left] = -alpha[has_left] * old_a[left[has_left]]

        bb[has_right] -= gamma[has_right] * old_a[right[has_right]]
        dd[has_right] -= gamma[has_right] * old_d[right[has_right]]
        cc[has_right] = -gamma[has_right] * old_c[right[has_right]]

    return dd / bb


def build_natural_spline_system(x: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Build the natural cubic spline tridiagonal system for second derivatives."""
    n = len(x)
    h = np.diff(x)
    a = np.zeros(n, dtype=float)
    b = np.ones(n, dtype=float)
    c = np.zeros(n, dtype=float)
    d = np.zeros(n, dtype=float)

    for i in range(1, n - 1):
        a[i] = h[i - 1]
        b[i] = 2.0 * (h[i - 1] + h[i])
        c[i] = h[i]
        left_slope = (y[i] - y[i - 1]) / h[i - 1]
        right_slope = (y[i + 1] - y[i]) / h[i]
        d[i] = 6.0 * (right_slope - left_slope)
    return a, b, c, d


def natural_spline_y2(x: np.ndarray, y: np.ndarray, solver: str) -> np.ndarray:
    a, b, c, d = build_natural_spline_system(x, y)
    if solver == "thomas":
        return thomas_solve(a, b, c, d)
    if solver == "pcr":
        return pcr_solve(a, b, c, d)
    raise ValueError(f"unknown solver: {solver}")


def spline_eval(x: np.ndarray, y: np.ndarray, y2: np.ndarray, xq: np.ndarray) -> np.ndarray:
    """Evaluate a natural cubic spline at query points xq."""
    k = np.searchsorted(x, xq, side="right") - 1
    k = np.clip(k, 0, len(x) - 2)
    h = x[k + 1] - x[k]
    A = (x[k + 1] - xq) / h
    B = (xq - x[k]) / h
    return (
        A * y[k]
        + B * y[k + 1]
        + ((A**3 - A) * y2[k] + (B**3 - B) * y2[k + 1]) * (h**2) / 6.0
    )


def make_synthetic_oct_data(m_lines: int, n_samples: int, seed: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Create an M x N matrix of raw OCT-like interferograms.

    x_raw simulates non-uniform k sampling. x_uniform is the target uniform k grid.
    """
    rng = np.random.default_rng(seed)
    t = np.linspace(0.0, 1.0, n_samples)
    x_raw = t**1.18
    x_uniform = np.linspace(x_raw[0], x_raw[-1], n_samples)

    envelope = np.exp(-0.5 * ((t - 0.48) / 0.22) ** 2)
    raw = np.empty((m_lines, n_samples), dtype=float)

    for m in range(m_lines):
        # Slowly varying "keyhole bottom" depth across lateral scan position.
        z1 = 18.0 + 2.0 * np.sin(2 * np.pi * m / m_lines)
        z2 = 43.0 + 4.0 * np.cos(2 * np.pi * m / (m_lines * 0.85))
        phase = 0.15 * m
        interferogram = (
            950.0
            + envelope
            * (
                220.0 * np.cos(2 * np.pi * z1 * x_raw + phase)
                + 95.0 * np.cos(2 * np.pi * z2 * x_raw + 0.4 * phase)
            )
            + rng.normal(0.0, 9.0, n_samples)
        )
        raw[m] = interferogram
    return x_raw, x_uniform, raw


def reconstruct(raw: np.ndarray, x_raw: np.ndarray, x_uniform: np.ndarray, solver: str) -> tuple[np.ndarray, np.ndarray]:
    """CPU version of the OCT reconstruction pipeline."""
    # Background subtraction: MeanKernel + SubKernel in the CUDA code.
    background = raw.mean(axis=0)
    subtracted = raw - background

    # K-linearization: one A-scan at a time. In CUDA: one block per A-scan.
    k_linear = np.empty_like(subtracted)
    for m in range(raw.shape[0]):
        y2 = natural_spline_y2(x_raw, subtracted[m], solver=solver)
        k_linear[m] = spline_eval(x_raw, subtracted[m], y2, x_uniform)

    # Apodization/compensation stand-in. Real code multiplies by complex Gc(k).
    window = np.hanning(raw.shape[1])
    compensated = k_linear * window[None, :]

    # Batched FFT: cufftPlanMany/cufftExecC2C in the CUDA code.
    fft_result = np.fft.fft(compensated, axis=1)
    amplitude = 20.0 * np.log10(1.0 + np.abs(fft_result))
    return k_linear, amplitude


def save_plot(
    out_path: Path,
    raw: np.ndarray,
    k_linear: np.ndarray,
    amplitude: np.ndarray,
    line_index: int,
) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("MPLCONFIGDIR", str(out_path.parent / ".mplconfig"))
    import matplotlib.pyplot as plt

    depth = np.arange(amplitude.shape[1] // 2)
    fig, axes = plt.subplots(2, 2, figsize=(12, 7), constrained_layout=True)

    axes[0, 0].plot(raw[line_index], lw=1.2)
    axes[0, 0].set_title("Raw interferogram: one A-scan before reconstruction")
    axes[0, 0].set_xlabel("spectrometer pixel")
    axes[0, 0].set_ylabel("intensity")

    axes[0, 1].plot(k_linear[line_index], lw=1.2, color="#0f766e")
    axes[0, 1].set_title("After background subtraction + K-linearization")
    axes[0, 1].set_xlabel("uniform k index")
    axes[0, 1].set_ylabel("signal")

    axes[1, 0].plot(depth, amplitude[line_index, : len(depth)], lw=1.2, color="#b45309")
    axes[1, 0].set_title("A-scan depth profile after FFT")
    axes[1, 0].set_xlabel("depth index")
    axes[1, 0].set_ylabel("20 log10(1 + magnitude)")

    b_scan = amplitude[:, : len(depth)].T
    im = axes[1, 1].imshow(b_scan, aspect="auto", cmap="magma", origin="upper")
    axes[1, 1].set_title("B-scan: many A-scans stacked laterally")
    axes[1, 1].set_xlabel("A-scan index / lateral position")
    axes[1, 1].set_ylabel("depth index")
    fig.colorbar(im, ax=axes[1, 1], shrink=0.85)

    fig.savefig(out_path, dpi=180)
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--M", type=int, default=48, help="number of A-scans in one B-scan")
    parser.add_argument("--N", type=int, default=256, help="samples per A-scan; power of two is recommended")
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--solver", choices=["thomas", "pcr"], default="pcr")
    parser.add_argument("--no-plot", action="store_true")
    args = parser.parse_args()

    x_raw, x_uniform, raw = make_synthetic_oct_data(args.M, args.N, args.seed)
    line = args.M // 2

    a, b, c, d = build_natural_spline_system(x_raw, raw[line] - raw.mean(axis=0))
    y2_thomas = thomas_solve(a, b, c, d)
    y2_pcr = pcr_solve(a, b, c, d)
    max_err = np.max(np.abs(y2_thomas - y2_pcr))
    rmse = np.sqrt(np.mean((y2_thomas - y2_pcr) ** 2))

    k_linear, amplitude = reconstruct(raw, x_raw, x_uniform, solver=args.solver)

    print("=== OCT CUDA pipeline teaching demo ===")
    print(f"Raw matrix shape: M x N = {args.M} x {args.N}")
    print("Meaning: M A-scans form one B-scan; each A-scan has N spectral samples.")
    print()
    print("Thomas vs PCR on the same cubic-spline tridiagonal system:")
    print(f"  max_abs_error = {max_err:.3e}")
    print(f"  rmse          = {rmse:.3e}")
    print()
    print("PCR dependency distance by level:")
    for level in range(math.ceil(math.log2(args.N))):
        print(f"  level {level:2d}: each row talks to neighbors +/- {1 << level}")
    print()
    print("CUDA mapping in the thesis implementation:")
    print("  grid.x = M, one CUDA block handles one A-scan")
    print("  block.x = 256, threads cooperate inside one A-scan")
    print("  shared memory stores a,b,c,d,y2,Lambda1 for PCR")
    print("  cuFFT executes an N-point FFT for all M A-scans as a batch")
    print()
    print("Output arrays:")
    print(f"  k_linear shape = {k_linear.shape}")
    print(f"  amplitude shape = {amplitude.shape}")

    if not args.no_plot:
        out_path = Path(__file__).with_name("oct_cuda_pipeline_demo.png")
        save_plot(out_path, raw, k_linear, amplitude, line)
        print(f"Saved plot: {out_path}")


if __name__ == "__main__":
    main()
