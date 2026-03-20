#include "Process_Data.h"


__constant__ float c_Lambda1[2048];
__constant__ float c_ddLambda[2048];

#define CUDA_CHECK(call) \
do { \
    cudaError_t err = call; \
    if (err != cudaSuccess) { \
        fprintf(stderr, "CUDA error at %s:%d code=%d (%s)\n", \
                __FILE__, __LINE__, err, cudaGetErrorString(err)); \
        exit(EXIT_FAILURE); \
    } \
} while (0)

__global__ void MergeKernel(float* dvc_input, float* dvc_output, int merge, int output_frames, int width) {
    int i = blockIdx.y * blockDim.y + threadIdx.y;  // output frame index
    int j = blockIdx.x * blockDim.x + threadIdx.x;  // pixel index (0~2047)

    if (i < output_frames && j < width) {
        float sum = 0.0f;
        for (int k = 0; k < merge; ++k) {
            sum += dvc_input[(i * merge + k) * width + j];
        }
        dvc_output[i * width + j] = sum;
    }
}
__global__ void Uint_Transform_FloatKernel(uint16_t* dvc_img1, float* dvc_img,int total);

__global__ void MeanKernel(float* dvc_img, float* dvc_mean,int M);

__global__ void SubKernel(float* dvc_img, float* dvc_mean, float* dvc_sub);

__global__ void LinearInterKernel(float* dvc_sub, float* dvc_w1, float* dvc_w2, int* dvc_index, float* dvc_inter);

__global__ void MutiplyKernel(cufftComplex* dvc_Gc, float* dvc_inter, cufftComplex* dvc_mutiply);

__global__ void AmplitudeKernel(cufftComplex* dvc_multiply, float* dvc_result);

//__global__ void ComputeRowMeans(float* input, float* dvc_base, int M, int length);

__global__ void MultiplyWithBase(float* input, float* base2, float* output, int M);

__global__ void MultiplyWithBase2(float* input, float* dvc_base2, float* output, int M, int length);

__global__ void MultiplyKernel(float* dvc_img_gsl, float* dvc_base2, float* dvc_img, int M, int length);

__global__ void splineInterpKernelV2(const float * __restrict__ Lambda1,const float * __restrict__ x1,const float * __restrict__ ddLambda,float * __restrict__ y);

__global__ void splineInterpKernelV2_optimized(const float * __restrict__ Lambda1, const float * __restrict__ x1, const float * __restrict__ ddLambda, float * __restrict__ y);

__global__ __launch_bounds__(256, 4) void splineInterpKernelV2_optimized_PCR(const float * __restrict__ x1, float * __restrict__ y, const float * __restrict__ ddLambda, const float * __restrict__ Lambda1);

Data::Data(int M) {
   
    blocknum = 512;
    gridnum = LENGTH * M / LoopNum / blocknum;
    dimBlock = blocknum;
    dimGrid = gridnum;

    n[0] = 2048;
    inembed[0] = 2048;  onembed[0] = 2048;
    inembed[1] = M; onembed[1] = M;
    cufftPlanMany(&plan, 1, n, inembed, 1, 2048, onembed, 1, 2048, CUFFT_C2C, M);

    ImportData(x, x1, hst_Gc);
    for (int i = 0; i < LENGTH; i++) {
        temp[i] = x1[LENGTH-1-i];
    }
    // for (int i = 0; i < 3; i++) {
    //     std::cout << "Lambda1[" << i << "] = " << x[i] << std::endl;
    //     std::cout << "ddLambda[" << i << "] = " << temp[i] << std::endl;
    // }
    cudaMalloc(&dvc_Lambda1, sizeof(float) * LENGTH);
    cudaMalloc(&dvc_ddLambda, sizeof(float) * LENGTH);
    cudaMemcpy(dvc_Lambda1, x, sizeof(float) * LENGTH, cudaMemcpyHostToDevice);
    cudaMemcpy(dvc_ddLambda, temp, sizeof(float) * LENGTH, cudaMemcpyHostToDevice);

    cudaMemcpyToSymbol(c_Lambda1,  x, LENGTH * sizeof(float));
    cudaMemcpyToSymbol(c_ddLambda, temp, LENGTH * sizeof(float));

    hst_img = (float*)malloc(M * LENGTH * sizeof(float));
    cudaMalloc((void**)&dvc_img_u, sizeof(uint16_t) * M * LENGTH);
    cudaMalloc((void**)&dvc_img, sizeof(float) * M * LENGTH);
    cudaMalloc((void**)&dvc_img_gsl, sizeof(float) * M * LENGTH);
    cudaMalloc((void**)&dvc_bg_u, sizeof(uint16_t) * M * LENGTH);
    cudaMalloc((void**)&dvc_bg, sizeof(float) * M * LENGTH);
   
    //cudaMalloc((void**)&dvc_base, sizeof(float) * LENGTH);         // 存储每一行的均值
    cudaMalloc((void**)&dvc_base2, sizeof(float) * LENGTH);        // 归一化后的 base2
    //cudaMalloc((void**)&dvc_gaussian, sizeof(float) * LENGTH);     // 高斯分布值

    cudaMalloc((void**)&dvc_sub, sizeof(float) * M * LENGTH);
    cudaMalloc((void**)&dvc_inter, sizeof(float) * M * LENGTH);
    cudaMalloc((void**)&dvc_multiply, sizeof(cufftComplex) * M * LENGTH);
    cudaMalloc((void**)&dvc_result, sizeof(float) * M * LENGTH);

    cudaMalloc((void**)&dvc_w1, sizeof(float) * LENGTH);
    cudaMalloc((void**)&dvc_w2, sizeof(float) * LENGTH);
    cudaMalloc((void**)&dvc_index, sizeof(int) * LENGTH);
    cudaMalloc((void**)&dvc_Gc, sizeof(cufftComplex) * LENGTH);
    Caculate_initial_value(x, x1);
    cudaMemcpy(dvc_w1, w1, sizeof(float) * LENGTH, cudaMemcpyHostToDevice);
    cudaMemcpy(dvc_w2, w2, sizeof(float) * LENGTH, cudaMemcpyHostToDevice);
    cudaMemcpy(dvc_index, index, sizeof(int) * LENGTH, cudaMemcpyHostToDevice);
    cudaMemcpy(dvc_Gc, hst_Gc, sizeof(cufftComplex) * LENGTH, cudaMemcpyHostToDevice);
    cudaMalloc((void**)&dvc_mean, sizeof(float) * LENGTH);
}
Data::~Data() {
    cudaFree(dvc_img);
    cudaFree(dvc_img_u);
    cudaFree(dvc_mean);
    cudaFree(dvc_sub);
    cudaFree(dvc_inter);
    cudaFree(dvc_w1);
    cudaFree(dvc_w2);
    cudaFree(dvc_index);
    cudaFree(dvc_Gc);
    cudaFree(dvc_multiply);
    cudaFree(dvc_result); 
    cudaFree(dvc_img_gsl);
    cufftDestroy(plan);
    //cudaFree(dvc_base);
    cudaFree(dvc_base2);
    //cudaFree(dvc_gaussian);
    cudaFree(dvc_ddLambda);
    cudaFree(dvc_Lambda1);
   
}

float* Data::data_process(int M,const uint16_t* hst_img_u, uint16_t* dvc_img_u, float* hst_img, float* dvc_img, float* dvc_mean, float* dvc_sub, float* dvc_inter, float* dvc_w1, float* dvc_w2, float* dvc_result, int* dvc_index,
    cufftComplex* dvc_Gc, cufftComplex* dvc_multiply, cufftHandle& plan, dim3 dimGrid, dim3 dimBlock, uint16_t* hst_bg_u,int merge,bool if3D,int iffirst, float* gsl,float* base,float* gsy,float* cal_img)
{   

    cudaMemcpy(dvc_img_u, hst_img_u, sizeof(uint16_t) * M * LENGTH, cudaMemcpyHostToDevice);


    int total = M * LENGTH;
    if (iffirst == 1)
    {   
        int i = 0;
        Uint_Transform_FloatKernel << <dimGrid, dimBlock >> > (dvc_img_u, dvc_img,total);
        cudaMemcpy(img_float, dvc_img, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);


        // 第一步：计算img_float每一列的均值存在base中 
        for (int i = 0; i < LENGTH; i++) {
            for (int j = 0; j < M; j++){
                base[i] += img_float[i+j*LENGTH];
            }
            base[i] /= M;
        }
        float mu = 1024.0f;
        float sigma = 350.0f;
        float scale = 500.0f;

        // 第二步:计算高斯分布存在dvc_gaussia中
        for (int i = 0; i < LENGTH; i++) {
            gsy[i] = exp(-(i - mu) * (i - mu) / (2 * sigma * sigma)) * scale;
        }   
        //第三步：归一化高斯分布
         i = 0;
        while (i < LENGTH)
        {
            if (base[i] == 0)
            {
                gsl[i] = 0;
            }
            else
            {
                gsl[i] = gsy[i] / base[i];
            }
            i++;
        }
        cudaMemcpy(dvc_base2, gsl, sizeof(float) * LENGTH, cudaMemcpyHostToDevice);
    }
    else if (iffirst == 0)
    {
        Uint_Transform_FloatKernel << <dimGrid, dimBlock >> > (dvc_img_u, dvc_img_gsl,total);
        // 第三步：计算输入数据与 dvc_base2 的乘积
        //MultiplyWithBase2 << <gridSize, blockSize >> > (dvc_img_gsl, dvc_base2, dvc_img, M, LENGTH);
        //MultiplyWithBase<<<LENGTH, M>>>(dvc_img_gsl, dvc_base2, dvc_img,M);
        dim3 dimBlock(16, 16); // Adjust as per your hardware for optimal performance
        dim3 dimGrid((LENGTH + dimBlock.x - 1) / dimBlock.x, (M + dimBlock.y - 1) / dimBlock.y);

        MultiplyKernel << <dimGrid, dimBlock >> > (dvc_img_gsl, dvc_base2, dvc_img, M, LENGTH);
        // cudaMemcpy(cal_img, dvc_img, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);
    }
    else
    {
        Uint_Transform_FloatKernel << <dimGrid, dimBlock >> > (dvc_img_u, dvc_img,total);
    }

    if (hst_bg_u != nullptr) {
        cudaMemcpy(dvc_bg_u, hst_bg_u, sizeof(uint16_t) * M * LENGTH, cudaMemcpyHostToDevice);
        //UintתFloat
        Uint_Transform_FloatKernel << <dimGrid, dimBlock >> > (dvc_bg_u, dvc_bg,total);
        //// ����OCT��������
        MeanKernel << <LENGTH / 1024, 1024 >> > (dvc_bg, dvc_mean, M);
        

        //// ��OCT��������
        SubKernel << <dimGrid, dimBlock >> > (dvc_img, dvc_mean, dvc_sub);
       
        //LinearInterKernel << <dimGrid, dimBlock >> > (dvc_sub, dvc_w1, dvc_w2, dvc_index, dvc_inter);

        // dim3 grid(M);
        // dim3 block(256);
        // splineInterpKernelV2<<<grid, block>>>(dvc_Lambda1, dvc_sub, dvc_ddLambda, dvc_inter);
        size_t shmem_bytes = 6 * LENGTH * sizeof(float); // 6×2048×8 = 98304 字节 = 96 KB
        dim3 grid(M), block(256);
        splineInterpKernelV2_optimized_PCR<<<grid, block, shmem_bytes>>>(dvc_sub, dvc_inter,dvc_ddLambda,dvc_Lambda1);

    }
    else {
        MeanKernel << <LENGTH / 1024, 1024 >> > (dvc_img, dvc_mean, M);
        //// ��OCT��������
        SubKernel << <dimGrid, dimBlock >> > (dvc_img, dvc_mean, dvc_sub);

        // cudaMemcpy(cal_img, dvc_sub, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);

        // LinearInterKernel << <dimGrid, dimBlock >> > (dvc_sub, dvc_w1, dvc_w2, dvc_index, dvc_inter);
        
        // dim3 grid(M);
        // dim3 block(256);
        // splineInterpKernelV2<<<grid, block>>>(dvc_Lambda1, dvc_sub, dvc_ddLambda, dvc_inter);

        size_t shmem_bytes = 6 * LENGTH * sizeof(float); // 6×2048×8 = 98304 字节 = 96 KB
        dim3 grid(M), block(256);
        splineInterpKernelV2_optimized_PCR<<<grid, block, shmem_bytes>>>(dvc_sub, dvc_inter,dvc_ddLambda,dvc_Lambda1);
        
        // cudaMemcpy(cal_img, dvc_inter, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);

    }
    

    MutiplyKernel << <dimGrid, dimBlock >> > (dvc_Gc, dvc_inter, dvc_multiply);


    gpuFFT(dvc_multiply, plan);

    AmplitudeKernel << <dimGrid, dimBlock >> > (dvc_multiply, dvc_result);

    // cudaMemcpy(cal_img, dvc_result, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);

    if (if3D) {
        cudaMemcpy(hst_img, dvc_result, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);
    }
    else {
        // float* hst_img0 = new float[M * 2048];
        // cudaMemcpy(hst_img0, dvc_result, sizeof(float) * M * LENGTH, cudaMemcpyDeviceToHost);
        // for (int i = 0; i < M / merge; i++) {
        //     for (int j = 0; j < 2048; j++) {
        //         float sum = 0.0f;
        //         for (int k = 0; k < merge; k++) {
        //             sum += hst_img0[i * 2048 * merge + k * 2048 + j];
        //         }
 
        //         hst_img[i * 2048 + j] = sum;
        //     }
        // }
        // delete hst_img0;
        float* dvc_merge_result;
        cudaMalloc(&dvc_merge_result, sizeof(float) * (M / merge) * 2048);
        
        dim3 block(32, 8), grid((2048 + 31) / 32, (M / merge + 7) / 8);
        MergeKernel<<<grid, block>>>(dvc_result, dvc_merge_result, merge, M / merge, 2048);
        
        cudaMemcpy(hst_img, dvc_merge_result, sizeof(float) * (M / merge) * 2048, cudaMemcpyDeviceToHost);
        
        cudaFree(dvc_merge_result);


    }

    return hst_img;
}

void Data::ImportData(float* x, float* x1, cufftComplex* hst_Gc) {
    float value;
    int count = 0;
    std::ifstream inputFile2("Lambda1.txt");
    while (inputFile2 >> value) {
        x[count] = value;
        count += 1;
    }

    count = 0;
    std::ifstream inputFile3("ddLambda.txt");
    while (inputFile3 >> value) {
        x1[count] = value;
        count += 1;
    }

    count = 0;
    std::ifstream inputFile4("Gc_real.txt");
    while (inputFile4 >> value) {
        hst_Gc[count].x = value;
        count += 1;
    }

    count = 0;
    std::ifstream inputFile5("Gc_imag.txt");
    while (inputFile5 >> value) {
        hst_Gc[count].y = -value;
        count += 1;
    }
}

void Data::Caculate_initial_value(float* x, float* x1) {
    int n = LENGTH;
    for (int j = 0; j < n; j++) {
        for (int i = 0; i < n - 1; i++) {
            if (x1[j] >= x[i + 1] && x1[j] <= x[i]) {
                index[j] = i;
                w1[j] = (x1[j] - x[i]) / (x[i + 1] - x[i]);
                w2[j] = 1 - w1[j];
            }
        }
    }
}

void Data::gpuFFT(cufftComplex* dvc_multiply, cufftHandle& plan) {
    cufftExecC2C(plan, dvc_multiply, dvc_multiply, CUFFT_FORWARD);
    cudaDeviceSynchronize();
}

__global__ void Uint_Transform_FloatKernel(uint16_t* dvc_img1, float* dvc_img, int total) {
    // int tid = threadIdx.x;
    // int bid = blockIdx.x;
    // int ind = tid + bid * blockDim.x;
    // for (int i = 0; i < LoopNum; i++) {
    //     dvc_img[ind * LoopNum + i] = (float)dvc_img1[ind * LoopNum + i];
    // }
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < total)
        dvc_img[idx] = (float)dvc_img1[idx];
}

__global__ void MeanKernel(float* dvc_img, float* dvc_mean,int M) {
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int i = tid + bid * blockDim.x;
    for (int j = 0; j < M; j++)
        dvc_mean[i] += dvc_img[j * LENGTH + i];
    //dvc_mean[i] = (float)(dvc_img1[i]/M);
    dvc_mean[i] /= M;
}

__global__ void SubKernel(float* dvc_img, float* dvc_mean, float* dvc_sub) {
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int ind = tid + bid * blockDim.x;
    for (int i = 0; i < LoopNum; i++) {
        dvc_sub[ind * LoopNum + i] = dvc_img[ind * LoopNum + i] - dvc_mean[(ind * LoopNum + i) % LENGTH];
    }
}

__global__ void LinearInterKernel(float* dvc_sub, float* dvc_w1, float* dvc_w2, int* dvc_index, float* dvc_inter) {
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int ind = tid + bid * blockDim.x;
    for (int i = 0; i < LoopNum; i++) {
        int k = (ind * LoopNum + i) % LENGTH;
        int a = (ind * LoopNum + i) / LENGTH * LENGTH;
        dvc_inter[ind * LoopNum + i] = dvc_sub[a + dvc_index[k]] * dvc_w2[k] + dvc_sub[a + dvc_index[k] + 1] * dvc_w1[k];
        //dvc_sub[dvc_index[k]]; *dvc_w2[k] + dvc_sub[dvc_index[k] + 1] * dvc_w1[k];
    }
}

__global__ void MutiplyKernel(cufftComplex* dvc_Gc, float* dvc_inter, cufftComplex* dvc_mutiply) {
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int ind = tid + bid * blockDim.x;
    for (int i = 0; i < LoopNum; i++) {
        dvc_mutiply[ind * LoopNum + i].x = dvc_inter[ind * LoopNum + i] * dvc_Gc[(ind * LoopNum + i) % LENGTH].x;
        dvc_mutiply[ind * LoopNum + i].y = dvc_inter[ind * LoopNum + i] * dvc_Gc[(ind * LoopNum + i) % LENGTH].y;
    }
}

__global__ void AmplitudeKernel(cufftComplex* dvc_multiply, float* dvc_result) {
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int ind = tid + bid * blockDim.x;
    for (int i = 0; i < LoopNum; i++) {
        dvc_result[ind * LoopNum + i] = 20*log10(1+sqrt(powf(dvc_multiply[ind * LoopNum + i].x, 2) + powf(dvc_multiply[ind * LoopNum + i].y, 2)));
    }
}

//__global__ void ComputeRowMeans(float* input, float* dvc_base, int M, int length)
//{
//    for (int i = 0; i < length; i++)
//    {
//        float sum = 0.0f;
//        for (int j = 0; j < M; j++)
//        {
//            sum += input[j * length + i];
//        }
//        dvc_base[i] = sum / M;
//    }
//}

__global__ void ComputeGaussianAndNormalize(float* dvc_base, float* dvc_base2, float* gaussian, int length, float mu, float sigma, float scale)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;

    if (idx < length)
    {
        // 生成高斯分布值
        gaussian[idx] = scale * exp(-((idx - mu) * (idx - mu)) / (2.0f * sigma * sigma));

        // 归一化高斯分布
        if (dvc_base[idx] != 0)
        {
            dvc_base2[idx] = gaussian[idx] / dvc_base[idx];
        }
        else
        {
            dvc_base2[idx] = 0; // 防止除以0
        }
    }
}
__global__ void MultiplyWithBase2(float* input, float* dvc_base2, float* output, int M, int length)
{
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    int total_length = M * length;

    if (idx < total_length)
    {
        int row_idx = idx % length;                    // 计算对应的行索引
        output[idx] = input[idx] * dvc_base2[row_idx]; // 用归一化后的值进行乘法操作
    }
}
//__global__ void MultiplyWithBase(float* input, float* base2, float* output ,int M) {
//    // 计算全局线程索引
//    int row = blockIdx.x; // 以行作为块索引
//    int col = threadIdx.x; // 以线程索引作为列索引
//
//    // 确保线程在有效范围内
//    if (row < M && col < LENGTH) {
//        output[row * LENGTH + col] = input[row * LENGTH + col] * base2[col];
//    }
//}
__global__ void MultiplyKernel(float* dvc_img_gsl, float* dvc_base2, float* dvc_img, int M, int length) {
    // Calculate the row and column indices for the current thread
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < M && col < LENGTH) {
        // Perform element-wise multiplication
        dvc_img[row * LENGTH + col] = dvc_img_gsl[row * LENGTH + col] * dvc_base2[col];
    }
}

/**
 * kernel: splineInterpKernel
 * 每个 block 处理一列曲线 x1[:, j]
 * 输入：
 *    Lambda1[LENGTH]  : 降序排列的插值节点横坐标数组
 *    x1[LENGTH*M]     : 尺寸为 N×M，列主序，即第 j 列起始位置为 x1 + j*LENGTH
 *    ddLambda[LENGTH] : 降序排列的待插值横坐标
 * 输出：
 *    y[LENGTH*M]      : 插值结果，列主序，大小同 x1
 */
__global__ void splineInterpKernelV2(
    const float * __restrict__ Lambda1,
    const float * __restrict__ x1,
    const float * __restrict__ ddLambda,
    float * __restrict__ y)
{
    // 共享内存：存放当前曲线的二阶导数 y2[] 及中间向量 u[]
    __shared__ float y2[LENGTH];
    __shared__ float u[LENGTH];

    // 当前 block 对应的曲线索引 j
    int j = blockIdx.x;  // j ∈ [0, M)
    // 指向第 j 列的指针
    const float *x_col = x1 + j * LENGTH;
    float *y_col = y   + j * LENGTH;

    // --------------------------------------------------------------------------------------------------
    // 1. 串行部分：Thomas 算法求解自然样条的二阶导数 y2[i]
    //    由于 Lambda1 是降序，需要用绝对值计算间距 h
    // --------------------------------------------------------------------------------------------------
    if (threadIdx.x == 0) {
        // 边界条件：自然样条，端点二阶导数为 0
        y2[0] = 0.0;
        u[0]  = 0.0;

        // 前向消元
        for (int i = 1; i < LENGTH - 1; ++i) {
            // 计算 h_{i-1}, h_i, h_sum（都取绝对值）
            float h_im1  = fabs(Lambda1[i]     - Lambda1[i - 1]);   // |x_i - x_{i-1}|
            float h_i    = fabs(Lambda1[i + 1] - Lambda1[i    ]);   // |x_{i+1} - x_i|
            float h_sum  = fabs(Lambda1[i + 1] - Lambda1[i - 1]);   // |x_{i+1} - x_{i-1}|
            // sig = h_{i-1} / (h_{i-1} + h_i)
            float sig    = h_im1 / h_sum;
            // p = sig * y2[i-1] + 2
            float p      = sig * y2[i - 1] + 2.0;
            // 临时存 y2[i] 用于回代（前向填充）
            y2[i] = (sig - 1.0) / p;
            // 计算 d1 = (x_{i+1} - x_i) / h_i，d2 = (x_i - x_{i-1}) / h_{i-1}
            float d1 = (x_col[i + 1] - x_col[i]) / h_i;
            float d2 = (x_col[i]     - x_col[i - 1]) / h_im1;
            // u[i] 用于存放前向因子
            u[i] = (6.0 * (d1 - d2) / h_sum - sig * u[i - 1]) / p;
        }
        // 右端点二阶导数为 0
        y2[LENGTH - 1] = 0.0;

        // 回代
        for (int i = LENGTH - 2; i >= 0; --i) {
            y2[i] = y2[i] * y2[i + 1] + u[i];
        }
    }
    // 确保 y2[] 已经被计算完毕
    __syncthreads();

    // --------------------------------------------------------------------------------------------------
    // 2. 并行部分：每个线程负责若干个 ddLambda[idx] 的插值计算
    // --------------------------------------------------------------------------------------------------
    for (int idx = threadIdx.x; idx < LENGTH; idx += blockDim.x) {
        float x = ddLambda[idx];
        // 二分查找：在降序数组 Lambda1 中找到 k，使得 Lambda1[k] >= x >= Lambda1[k+1]
        int lo = 0, hi = LENGTH - 1;
        while (hi - lo > 1) {
            int mid = (lo + hi) >> 1;
            if (Lambda1[mid] < x) {
                // 中间值小于目标，说明要往左半区（下标更小）
                hi = mid;
            } else {
                // 中间值大于等于目标，往右半区（下标更大）
                lo = mid;
            }
        }
        int k = lo;
        // 计算区间宽度 h = |Lambda1[k] - Lambda1[k+1]|
        float h = fabs(Lambda1[k + 1] - Lambda1[k]);
        if (h == 0.0) {
            // 如果两个节点重合（理论上不会出现），直接取 x_col[k]
            y_col[idx] = x_col[k];
        } else {
            // A = (Lambda1[k] - x) / h，B = (x - Lambda1[k+1]) / h
            float A = (Lambda1[k + 1]     - x) / h;
            float B = (x - Lambda1[k]) / h;
            // 样条插值公式
            y_col[idx] = A * x_col[k] + B * x_col[k + 1] + ((A*A*A - A) * y2[k] + (B*B*B - B) * y2[k + 1]) * (h*h) / 6.0;
        }
    }
}

// =============================================================================
// 3. Kernel：每个 Block 处理一列曲线 x1[:, j]，得到 y[:, j]
//    - 对 Lambda1、ddLambda 做缓存到共享内存
//    - 前向 + 回代都在共享内存中完成
//    - 插值时用 __ldg() 访问 x1，只读缓存提速
// =============================================================================
    __global__ __launch_bounds__(256, 4) void splineInterpKernelV2_optimized_PCR(
        const float * __restrict__ x1,   // 全局：大小 N×M，列主序：x1[j*LENGTH + i]
        float * __restrict__ y,
        const float * __restrict__ ddLambda,
        const float * __restrict__ Lambda1)          // 全局：大小 N×M，列主序，输出插值结果
    {
        // -------------------------------------------------------------------------
        // 3.1 共享内存布局
        //    - Lambda1[i]: 缓存 c_Lambda1[i]，大小 LENGTH
        //    - s_a[i], s_b[i], s_c[i], s_d[i]: 三对角系数，大小均为 LENGTH
        //    - s_y2[i]: 结果存放区，大小 LENGTH
        //    总共：5*LENGTH*8 + LENGTH*8 = 6*LENGTH*8 = 6*2048*8 = 98304 字节（约 96 KB）
        // -------------------------------------------------------------------------
        extern __shared__ float shared_mem[];
        // 按偏移来划分：
        //   shared_mem[  0 ... LENGTH-1] => Lambda1[i]
        //   shared_mem[LENGTH ... 2N-1] => s_a[i]
        //   shared_mem[2N ... 3N-1] => s_b[i]
        //   shared_mem[3N ... 4N-1] => s_c[i]
        //   shared_mem[4N ... 5N-1] => s_d[i]
        //   shared_mem[5N ... 6N-1] => s_y2[i]
        float *sLambda1 = shared_mem + 0 * LENGTH;
        float *s_a      = shared_mem + 1 * LENGTH;
        float *s_b      = shared_mem + 2 * LENGTH;
        float *s_c      = shared_mem + 3 * LENGTH;
        float *s_d      = shared_mem + 4 * LENGTH;
        float *s_y2     = shared_mem + 5 * LENGTH;
    
        // -------------------------------------------------------------------------
        // 3.2 将 c_Lambda1[] 从常量复制到共享 Lambda1[]
        //     由各线程协作完成，每次 threadIdx.x 拷一个元素，直到 2048 个
        // -------------------------------------------------------------------------
        for (int idx = threadIdx.x; idx < LENGTH; idx += blockDim.x) {
            sLambda1[idx] = c_Lambda1[idx];
        }
        __syncthreads();  // 确保 Lambda1[] 拷贝完毕
    
        // -------------------------------------------------------------------------
        // 3.3 当前 block 对应曲线索引 j ∈ [0, M)
        // -------------------------------------------------------------------------
        int j = blockIdx.x;
        const float *x_col = x1 + j * LENGTH;   // 第 j 条曲线的原始 y 值 (长度 LENGTH)
        float *y_col = y + j * LENGTH;          // 第 j 条曲线的插值输出 (长度 LENGTH)
    
        // -------------------------------------------------------------------------
        // 3.4 构造三对角系数向量 a[i], b[i], c[i], d[i]
        //     数学公式（自然边界）：
        //       对 i=1..LENGTH-2:
        //         h_im1 = |Lambda1[i] - Lambda1[i-1]|
        //         h_i   = |Lambda1[i+1] - Lambda1[i]|
        //         A[i]  = h_im1
        //         B[i]  = 2 * (h_im1 + h_i)
        //         C[i]  = h_i
        //         D[i]  = 6 * [ (f[i+1] - f[i]) / h_i  -  (f[i] - f[i-1]) / h_im1 ]
        //       边界：
        //         B[0] = 1, C[0] = 0, D[0] = 0   (即 y2[0] = 0)
        //         A[LENGTH-1] = 0, B[LENGTH-1] = 1, D[LENGTH-1] = 0 (即 y2[LENGTH-1] = 0)
        //
        //     由 Lambda1[] 拿到 Lambda1[i]，由 x_col 拿到 f[i]，用 __ldg() 以走只读缓存
        // -------------------------------------------------------------------------
        for (int idx = threadIdx.x; idx < LENGTH; idx += blockDim.x) {
            if (idx == 0) {
                // 左边界
                s_a[0]   = 0.0;
                s_b[0]   = 1.0;
                s_c[0]   = 0.0;
                s_d[0]   = 0.0;
            }
            else if (idx == LENGTH - 1) {
                // 右边界
                s_a[LENGTH - 1] = 0.0;
                s_b[LENGTH - 1] = 1.0;
                s_c[LENGTH - 1] = 0.0;
                s_d[LENGTH - 1] = 0.0;
            }
            else {
                // i = 1..LENGTH-2
                // 计算 h_im1, h_i, hsum（都取 fabs() 以应对“降序”）
                float hi_m1 = fabs(sLambda1[idx]     - sLambda1[idx - 1]);
                float hi    = fabs(sLambda1[idx + 1] - sLambda1[idx    ]);
                float hsum  = hi_m1 + hi;  // = |Lambda1[i+1] - Lambda1[i-1]|
    
                // 三对角系数
                s_a[idx] = hi_m1;                     // A[i]
                s_b[idx] = 2.0 * (hi_m1 + hi);        // B[i]
                s_c[idx] = hi;                        // C[i]
    
                // 差商：用 __ldg() 从全局只读缓存取 f[i]
                float fi_p1 = __ldg(x_col + (idx + 1));  // f[i+1]
                float fi    = __ldg(x_col + idx);        // f[i]
                float fi_m1 = __ldg(x_col + (idx - 1));  // f[i-1]
    
                float d1 = (fi_p1 - fi) / hi;
                float d2 = (fi    - fi_m1) / hi_m1;
                s_d[idx] = 6.0 * (d1 - d2);        // D[i]

            }
            // if(idx < 10)
            // printf("idx = %d;s_a = %.6f;s_b = %.6f;s_c = %.6f;s_d = %.6f\n",idx,s_a[idx],s_b[idx],s_c[idx],s_d[idx]);
        }
        __syncthreads();  // 等待所有三对角系数构造完毕
    
        // -------------------------------------------------------------------------
        // 3.5 PCR 迭代：并行循环还原
        //     - 我们需要做 log2(LENGTH) 轮（N=2048 => 11 轮）
        //     - 每轮消去相隔 step = 2^level 的未知量
        //     - new_a[i], new_b[i], new_c[i], new_d[i] 会分别写回 s_a[i], s_b[i], s_c[i], s_d[i]
        // -------------------------------------------------------------------------
        // 临时寄存器存放本轮的 a_i, b_i, c_i, d_i 以及两端的 neighbor
        float a_i, b_i, c_i, d_i;
        float a_l, b_l, c_l, d_l;  // 左侧 neighbor
        float a_r, b_r, c_r, d_r;  // 右侧 neighbor
    
        // PCR 迭代层数：level ∈ [0, 10] 共 11 层
        for (int level = 0; level < 11; ++level) {
            int offset = 1 << level;     // offset = 1, 2, 4, 8, ..., 1024
    
            // 每个线程并行处理所有 i ∈ [0, LENGTH)，注意边界要避开
            for (int idx = threadIdx.x; idx < LENGTH; idx += blockDim.x) {
                // 如果 idx 本身是边界(0,LENGTH-1)，在最末轮后会保持 y2=0；这里只直接跳过
                if (idx == 0 || idx == LENGTH - 1) {
                    continue;
                }
                // 左侧 neighbor jL = idx - offset, 右侧 neighbor jR = idx + offset
                int jL = idx - offset;
                int jR = idx + offset;
                if (jL < 1 || jR >= LENGTH-2) {
                    // 如果 out of bounds，就丢弃在本层不参与更新，等待更低层再来
                    continue;
                }
    
                // 读当前 idx 的系数 a_i,b_i,c_i,d_i
                a_i = s_a[idx];  b_i = s_b[idx];  c_i = s_c[idx];  d_i = s_d[idx];
                // 读左 neighbor
                a_l = s_a[jL];  b_l = s_b[jL];  c_l = s_c[jL];  d_l = s_d[jL];
                // 读右 neighbor
                a_r = s_a[jR];  b_r = s_b[jR];  c_r = s_c[jR];  d_r = s_d[jR];
    
                // PCR 消去：数学推导见文献。我们直接给公式：
                //   α = a_i / b_l
                //   γ = c_i / b_r
                //   new_b_i = b_i - c_l * α - a_r * γ
                //   new_d_i = d_i - d_l * α - d_r * γ
                //   new_a_i = - a_l * α
                //   new_c_i = - c_r * γ
                float alpha =  a_i / b_l;
                float gamma =  c_i / b_r;
    
                float new_b = b_i - c_l * alpha - a_r * gamma;
                float new_d = d_i - d_l * alpha - d_r * gamma;
                float new_a = - a_l * alpha;
                float new_c = - c_r * gamma;
    
                // 写回共享数组
                s_b[idx] = new_b;
                s_d[idx] = new_d;
                s_a[idx] = new_a;
                s_c[idx] = new_c;
            }
            __syncthreads();  // 每层必须等所有线程完成后再进入下一层
        }
    
        // -------------------------------------------------------------------------
        // 3.6 最终每个 idx ∈ (0, LENGTH-1) 都有了简化后的：
        //        b_i' * y2[i] = d_i'
        //     只要每个线程做除法：y2[i] = d_i' / b_i'；两端自然边界 y2[0]=y2[LENGTH-1]=0
        // -------------------------------------------------------------------------
        for (int idx = threadIdx.x; idx < LENGTH; idx += blockDim.x) {
            if (idx == 0 || idx == LENGTH - 1) {
                s_y2[idx] = 0.0;
            } else {
                s_y2[idx] = s_d[idx] / s_b[idx];
            }
            // if(idx < 10)
            // printf("idx = %d;s_a = %.6f;s_b = %.6f;s_c = %.6f;s_d = %.6f;s_y2 = %.6f\n",idx,s_a[idx],s_b[idx],s_c[idx],s_d[idx],s_y2[idx]);
        }
        __syncthreads();  // 确保 s_y2[] 写完
    
        // -------------------------------------------------------------------------
        // 3.7 并行插值：利用“降序连续”特性，直接下标映射 kd = idx
        //     - 读 x = c_ddLambda[idx]
        //     - 区间 k = idx （因为 Lambda1, ddLambda 都是降序且间距一致）
        //     - h = |Lambda1[k] - Lambda1[k+1]| = fabs(Lambda1[k] - Lambda1[k+1])
        //     - A = (Lambda1[k] - x)/h, B = (x - Lambda1[k+1])/h
        //     - y = A*f[k] + B*f[k+1] + ((A^3-A)*y2[k] + (B^3-B)*y2[k+1]) * h^2 / 6
        // -------------------------------------------------------------------------
        for (int idx = threadIdx.x; idx < LENGTH; idx += blockDim.x) {
            // 因为 ddLambda、Lambda1 下标一一对应：k = idx
            float x = ddLambda[idx];  // 待插值横坐标

            int lo = 0, hi = LENGTH - 1;
            while (hi - lo > 1) {
                int mid = (lo + hi) >> 1;
                if (sLambda1[mid] < x) {
                    // 中间值小于目标，说明要往左半区（下标更小）
                    hi = mid;
                } else {
                    // 中间值大于等于目标，往右半区（下标更大）
                    lo = mid;
                }
            }
            int k = lo;
            // // 如果 k == 0，那么 k-1 越界。对于第一点(最大节点)，直接等于 f[0]
            // if (k == 0) {
            //     s_y2[k] = 0.0;  // 此处 y2[0] = 0，本行仅为了对齐
            //     y_col[k] = __ldg(x_col);
            //     continue;
            // }
            // 如果 k == LENGTH-1，那么 k+1 越界。对于最后一点(最小节点)，直接等于 f[LENGTH-1]
            if (k == LENGTH - 1) {
                s_y2[k] = 0.0;  // 此处 y2[LENGTH-1] = 0，本行仅为了对齐
                y_col[k] = __ldg(x_col + (LENGTH - 1));
                continue;
            }
    
            // h = |Lambda1[k] - Lambda1[k+1]|
            float h = fabs(sLambda1[k] - sLambda1[k + 1]);

            if (h == 0.0) {
                // 万一节点重合，直接返回 f[k]
                y_col[idx] = __ldg(x_col + k);
            } else {
                // A, B 系数
                float A = (sLambda1[k + 1]     - x) / h;
                float B = (x             - sLambda1[k]) / h;
                // if(k < 10)
                //     printf("k = %d;x=%f;sLambda1[k+1]=%f;A=%f;B=%f\n", k, x,sLambda1[k+1],A,B);
                // 读 f[k], f[k+1]
                float fk   = __ldg(x_col + k);
                float fk1  = __ldg(x_col + (k + 1));
                // 读 y2[k], y2[k+1]
                float y2k  = s_y2[k];
                float y2k1 = s_y2[k + 1];
    
                // 样条插值公式
                y_col[idx] = A * fk + B * fk1 + ((A*A*A - A) * y2k + (B*B*B - B) * y2k1) * (h*h) / 6.0;
                // if(k < 10)
                //     printf("k = %d;y2k = %f;y2k1 = %f\n",k,y2k,y2k1);
            }
        }
        // 不需要再 __syncthreads()，因为 kernel 即将结束
    }