# CUDA Reconstruction Speaker Notes

## 1. One-sentence logic

This part solves the first engineering problem in the thesis: the OCT system
captures raw spectral interferograms, but the segmentation model needs OCT
depth images. Therefore, the raw M x N spectral matrix must be reconstructed
fast enough for online welding monitoring.

Suggested wording:

> This section focuses on real-time OCT reconstruction. The spectrometer does
> not directly output an OCT image. It outputs a raw spectral interferogram.
> Each A-scan is one spectral line with N = 2048 samples. M adjacent A-scans
> form one B-scan frame. My optimization is to move the whole SD-OCT
> post-processing pipeline to CUDA, especially the K-linearization and FFT
> stages, so the reconstruction speed can match the 82 kHz acquisition rate.

## 2. What the data looks like

In the code, one B-scan frame is stored as a flat array:

```cpp
dvc_img[row * LENGTH + col]
```

where:

- `row` is the A-scan index, from `0` to `M - 1`.
- `col` is the spectral sample index inside one A-scan, from `0` to `N - 1`.
- `LENGTH = N = 2048`.

Suggested wording:

> At the memory level, the input is not an image in the normal RGB sense. It is
> an M x N matrix. M is the number of A-scans in one B-scan, and N is the number
> of spectral samples in each A-scan. In my implementation, N is fixed at 2048.
> The array is stored row by row, so the element at the m-th A-scan and the n-th
> sample is accessed as `m * LENGTH + n`.

## 3. Why CUDA is suitable

Most steps have little dependency between pixels or A-scans:

- type conversion: each thread converts one value
- spectral shaping: each thread multiplies one value
- background subtraction: each thread subtracts a column mean
- dispersion compensation: each thread multiplies one spectral point
- amplitude mapping: each thread computes one output value
- FFT: cuFFT batches M independent A-scans

Suggested wording:

> The reason this task is suitable for CUDA is that most operations are either
> element-wise or per-A-scan independent. For example, converting uint16 to
> float, multiplying by calibration coefficients, subtracting background, and
> extracting FFT amplitude can all be mapped to many threads. Different A-scans
> do not need to wait for one another. This matches the GPU execution model.

## 4. Thread mapping for the simple kernels

Example from `Uint_Transform_FloatKernel`:

```cpp
int idx = blockIdx.x * blockDim.x + threadIdx.x;
if (idx < total)
    dvc_img[idx] = (float)dvc_img1[idx];
```

Suggested wording:

> The simplest kernel is type conversion. Here, the global thread index is
> computed by `blockIdx.x * blockDim.x + threadIdx.x`. Each thread handles one
> element in the M x N array. The boundary check prevents out-of-range access
> when the total number of elements is not exactly divisible by the block size.

## 5. The real bottleneck: K-linearization

K-linearization is needed because FFT assumes uniform sampling in wavenumber
space, but the spectrometer samples approximately uniformly in wavelength or
pixel space.

Suggested wording:

> K-linearization is the key step before FFT. The FFT assumes the input samples
> are uniformly distributed in k-space. However, the spectrometer pixels are not
> naturally uniform in k-space. If we directly apply FFT, the reconstructed
> depth signal can become broadened or distorted. Therefore, we resample each
> A-scan from the original non-uniform k coordinates to a uniform k grid.

## 6. Why Thomas is bad for GPU

Natural cubic spline interpolation needs the second derivative vector `y2`.
Computing `y2` requires solving a tridiagonal system:

```text
a[i] * y2[i-1] + b[i] * y2[i] + c[i] * y2[i+1] = d[i]
```

Thomas algorithm solves it with forward elimination and backward substitution.
That is efficient on CPU but serial.

Suggested wording:

> The traditional Thomas algorithm has strong forward and backward dependency.
> The result of the previous row is needed before computing the next row. On a
> CPU, this is acceptable. But on a GPU, if one thread solves the tridiagonal
> system serially, the other 255 threads in the block are mostly waiting. This
> wastes the parallel hardware.

## 7. Why PCR is better for GPU

PCR changes the dependency distance by levels:

```text
level 0: depend on i - 1 and i + 1
level 1: depend on i - 2 and i + 2
level 2: depend on i - 4 and i + 4
...
level 10: depend on i - 1024 and i + 1024
```

For N = 2048, this gives 11 levels.

Suggested wording:

> PCR, or Parallel Cyclic Reduction, removes this serial dependency by
> eliminating neighboring unknowns level by level. In the first level, each row
> uses its left and right neighbor. In the second level, it uses neighbors two
> positions away. Then four, eight, and so on. For N = 2048, the number of
> levels is log2(2048), which is 11. Within each level, all rows can be updated
> in parallel, so the 256 threads in one block can cooperate on the same A-scan.

## 8. CUDA implementation of PCR

The CUDA launch configuration in the thesis code is:

```cpp
dim3 grid(M), block(256);
splineInterpKernelV2_optimized_PCR<<<grid, block, shmem_bytes>>>(...);
```

Meaning:

- one block handles one A-scan
- 256 threads cooperate inside the block
- each thread processes indices `idx = threadIdx.x; idx < LENGTH; idx += blockDim.x`
- shared memory stores `Lambda1`, `a`, `b`, `c`, `d`, and `y2`

Suggested wording:

> In my implementation, the grid size is M, so each CUDA block corresponds to
> one A-scan. Each block has 256 threads. Because one A-scan has 2048 samples,
> each thread processes several sample positions with a stride of 256. The
> tridiagonal coefficients and the final second derivatives are placed in shared
> memory, because PCR repeatedly reads and writes these arrays inside the same
> block. This avoids repeatedly accessing slower global memory.

## 9. Memory hierarchy

Suggested wording:

> The optimization is not only algorithmic but also memory-related. Global
> memory is large but slow. Shared memory is much faster and is shared by
> threads in the same block, so it is used for PCR coefficients. Constant memory
> is suitable for calibration arrays such as interpolation nodes because all
> threads repeatedly read the same values. The original signal is read through
> the read-only cache path. These choices reduce memory latency in the most
> frequently accessed parts of the pipeline.

## 10. Unified memory and small B-scan latency

Suggested wording:

> For large M, computation dominates the total time. But for small B-scans, the
> actual computation becomes short, while fixed overhead such as host-to-device
> copy, device-to-host copy, and synchronization still exists. Therefore, the
> latency does not decrease linearly as M becomes smaller. This is why I also
> used unified memory and event synchronization. Unified memory reduces explicit
> data copy management, and event synchronization avoids unnecessary global
> blocking. The result is more obvious in small-B-scan cases, for example when M
> decreases to 50, the latency drops from 289 us to 178 us.

## 11. Closing statement

Suggested wording:

> To summarize this part, the reconstruction optimization has three levels.
> First, the complete SD-OCT post-processing chain is kept on the GPU as a
> pipeline. Second, the K-linearization bottleneck is changed from serial
> Thomas solving to parallel PCR solving. Third, the memory layout and transfer
> strategy are optimized using shared memory, constant memory, read-only cache,
> unified memory, and event synchronization. With these optimizations, the
> reconstruction speed reaches 0.74 ms per frame and 1351k A-line/s, which is
> higher than the 82 kHz acquisition requirement.

