---
title: "Sai's GPU Brrr Reading List"
author: Sai Kumar Murali Krishnan
created: 2026-06-21
tags: [blog]
summary: "A GPU-performance reading map for making deep learning faster: hardware hierarchy, rooflines, kernels, profiling, distributed training, serving, quantization, and monokernels."
topic: systems
---

# GPU Brrr Reading List

I've found myself reading articles, blogs, papers and lecture notes across $\{\text{ML}, \text{SWE}, \text{Maths}\}$ as a form of passive learning, then turning the useful bits into implementation later.

This page is just the GPU/performance side of that habit. How do we make the GPU go brr? The answer?

1. Understand the expensive bit of hardward
2. Measure and profile
3. Attack wasted movement, launches and idle time, keep everything close together
4. Fuse it back together.

## Act 1: The GPU Hierarchy

Three hierarchies get taught together because they interact constantly: execution hierarchy, hardware hierarchy and memory hierarchy.

- Execution: grid, blocks, warps, threads.
- Hardware: GPU, SMs, tensor cores / CUDA cores.
- Memory: registers, shared memory / SRAM, L2, HBM.

Small mental note: each block runs on an SM (Streaming Multiprocessor, think like a CPU); the GPU chip is the grid. Within the hierarchy, registers are closest/fastest, then shared memory, then global memory/HBM.

Core idea: **compute is cheap; moving data is expensive.** Most of the resources below are different ways of moving fewer bytes, moving smaller bytes, reusing bytes more often, or keeping the GPU busy while bytes are moving.

### Resources

- [GPU Execution Model - Modern GPU Programming For MLSys](https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_background/index.html) - concise overview of the GPU execution model.
- [Modern GPU Programming for ML Systems](https://mlc.ai/modern-gpu-programming-for-mlsys/) - full course/book-style path for GPU programming in ML systems.
- [Give Me 30 min, I'll Make CUDA Click Forever](https://www.youtube.com/watch?v=xewKxorikwE) - CUDA mental model video.
- [CUDA MODE lectures](https://github.com/cuda-mode/lectures) - CUDA/GPU programming lectures.
- [CUDA MODE lecture 001 materials](https://github.com/anmolgupt/cuda_mode_lectures/tree/main/lecture_001) - lecture materials from the replay dump.
- [Stanford CS149 Lecture 1: Why Parallelism? Why Efficiency?](https://www.youtube.com/watch?v=V1tINV2-9p4) - parallel-computing context.

## Act 1.5: The GPU Is a Moving Target

There is not one GPU. Each generation moves the numbers: HBM bandwidth and capacity, tensor-core throughput, supported precision formats and async data-movement machinery.

That matters because the best optimization depends on the hardware. Ampere, Hopper and Blackwell do not have the same precision formats, memory hierarchy details, or kernel sweet spots.

### Resources

- [Modern GPU Programming for ML Systems](https://mlc.ai/modern-gpu-programming-for-mlsys/) - useful for the generation-by-generation hardware context.
- [Some matrix multiplication engines are not as accurate as we thought](https://pytorch.org/blog/some-matrix-multiplication-engines-are-not-as-accurate-as-we-thought/) - hardware/runtime numerics are part of performance engineering.
- [AI Systems Performance Engineering](https://www.booktopia.com.au/ai-systems-performance-engineering-chris-fregly/book/9798341627789.html) - book reference for AI performance engineering.

## Act 2: Performance Models and Rooflines

Before touching a kernel, identify which resource is limiting it:

- Compute: math units are saturated.
- Memory: math units are waiting for bytes.
- Overhead: launches/setup/synchronization dominate.

The roofline model is the main picture: low arithmetic intensity lives on the memory-bandwidth diagonal; high arithmetic intensity hits the compute ceiling. A lot of deep learning optimization is pushing work up and right by increasing reuse or avoiding materialization.

### Resources

- [Making Deep Learning Go Brrrr From First Principles](https://horace.io/brrr_intro.html) - roofline model, arithmetic intensity, and the base mental model for "why isn't this faster?"
- [How To Scale Your Model](https://jax-ml.github.io/scaling-book/) - the JAX scaling book; systems view of LLMs, rooflines, parallelism and large-scale training economics.
- [Transformer Inference Arithmetic](https://kipp.ly/transformer-inference-arithmetic/) - forward-pass and KV-cache arithmetic for inference.
- [Machine Learning Systems](https://mlsysbook.ai/) - broad ML systems book/reference.
- [A Hitchhiker's Guide to ML Training Infrastructure](https://www.sei.cmu.edu/blog/a-hitchhikers-guide-to-ml-training-infrastructure/) - broad overview of training infrastructure and hardware acceleration.

## Act 3: Profiling, `torch.compile` and Fusion

The first optimization baseline is measurement. After that, the first automatic optimization is often compilation/fusion: capture the graph, remove Python overhead, fuse operations, and avoid HBM round-trips for intermediates.

The catch: graph capture is shape-sensitive. Variable sequence length, video resolution, frame count and batch shape can turn "free speedup" into repeated recompilation unless shapes are bucketed or handled deliberately.

### Resources

- [Profiling in PyTorch, Part 1: A Beginner's Guide to torch.profiler](https://huggingface.co/blog/torch-profiler) - getting useful traces out of PyTorch.
- [Profiling in PyTorch, Part 2: From nn.Linear to a Fused MLP](https://huggingface.co/blog/torch-mlp-fusion) - profiling through to fusion.
- [GPU MODE Lecture 1: How to profile CUDA kernels in PyTorch](https://christianjmills.com/posts/cuda-mode-notes/lecture-001/#optimization-profiling-with-nsight-compute) - Nsight/PyTorch profiling notes.
- [Aritra on X: Profiling deep learning layers](https://x.com/ariG23498/status/2065025515241562322) - thread on layer profiling.
- [Making GPUs Actually Fast: A Deep Dive into Training Performance](https://www.youtube.com/watch?v=pHqcHzxx6I8) - Jane Street video on training performance.
- [JINO-ROHIT/ml-systems-notes](https://github.com/JINO-ROHIT/ml-systems-notes/tree/main) - notes around Torch, distributed systems and ML systems.

## Act 4: Custom Kernels and FlashAttention

Do not materialize large intermediates in HBM if they can be tiled, streamed, fused or consumed immediately. Do as much as you can in SRAM, or the shared memory.

Matmul is the warmup example: naive global-memory reads, then coalescing, shared-memory tiling, register tiling, and eventually more hardware-specific tricks like async copies and warp specialization.

FlashAttention is the attention version of the same idea: never build the full $N \times N$ score matrix in HBM. Tile the computation, keep the online softmax state, and stream blocks through fast memory.

### Kernel Resources

- [How to Optimize a CUDA Matmul Kernel for cuBLAS-like Performance](https://siboehm.com/articles/22/CUDA-MMM) - Simon Boehm's CUDA matmul worklog.
- [Fast matrix multiplication on CPU](https://siboehm.com/articles/22/Fast-MMM-on-CPU) - useful contrast with GPU performance thinking.
- [Triton vector addition tutorial](https://triton-lang.org/main/getting-started/tutorials/01-vector-add.html) - first small Triton kernel.
- [Triton Puzzles](https://github.com/gpu-mode/Triton-Puzzles) - practice problems for Triton.
- [Hugging Face Kernel Builder](https://huggingface.co/blog/kernel-builder) - practical workflow for custom kernels.
- [Lecture 106: Hugging Face Kernels](https://www.youtube.com/watch?v=Ok8vi6JemVQ) - video on Hugging Face kernels.
- [My first Multi-GPU kernel: Writing All-to-all for AMD MI300X](https://gau-nernst.github.io/amd-a2a/) - multi-GPU all-to-all kernel writeup.
- [Making video go BRRRR](https://x.com/waterloo_intern/status/2070643039668974060) - video performance thread.


### FlashAttention Resources

- [FlashAttention paper](https://arxiv.org/abs/2205.14135) - attention as a memory-bound problem.
- [FlashAttention Triton implementation](https://github.com/Dao-AILab/flash-attention/blob/main/flash_attn/flash_attn_triton.py) - source-level reference.
- [Flash Attention from Scratch Part 1](https://lubits.ch/flash/Part-1) - implementation-oriented explanation.
- [flash-attention-jax](https://github.com/lucidrains/flash-attention-jax) - JAX implementation.
- [Causal FlashAttention in JAX](https://github.com/lucidrains/flash-attention-jax/blob/main/flash_attention_jax/causal_flash_attention.py) - specific causal attention file.

## Act 5: Multi-GPU Training and Communication

Once one GPU is not enough, the memory hierarchy extends across devices. Moving data between GPUs is another expensive rung, so the same "move less / overlap more" principle returns.

Core vocabulary:

- Data parallelism: replicate model, split data, all-reduce gradients.
- Tensor parallelism: split layer math across devices.
- Pipeline parallelism: split depth into stages; watch for bubbles.
- FSDP / ZeRO: shard parameters, gradients and optimizer states.
- Collectives: all-reduce, all-gather, reduce-scatter.

### Resources

- [Stanford CS336: Language Modeling from Scratch](https://cs336.stanford.edu/) - broad spine for language-model systems.
- [CS336 lecture 2 trace](https://cs336.stanford.edu/lectures/?trace=lecture_02) - PyTorch/einops trace from the course.
- [CS336 Lecture 2: PyTorch/einops](https://www.youtube.com/watch?v=kuYAsz7zspQ&list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV&index=6) - video lecture.
- [The Ultra-Scale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook) - Hugging Face/Nanotron guide to large-scale training.
- [Ultra-Scale Playbook: Gradient Accumulation](https://huggingface.co/spaces/nanotron/ultrascale-playbook?section=gradient_accumulation) - specific section from the replay.
- [Ultra-Scale Playbook: Kernels](https://huggingface.co/spaces/nanotron/ultrascale-playbook?section=kernels) - specific section from the replay.
- [Smol Training Playbook](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook) - practical training setup and parallelism choices.
- [Megatron-LM pipeline parallelism](https://arxiv.org/abs/2104.04473) - pipeline bubbles and large-scale transformer training.
- [Jino Rohit's collective communication notes](https://jino-rohit.github.io/blogs/11_collective_communication.html) - communication primitives and distributed performance intuition.
- [Transport Muon: Beating Muon in Speed and Performance in 1 Newton Step](https://ethansmith2000.substack.com/p/transport-muon-beating-muon-in-speed) - optimizer/performance reading.

## Act 6: Inference and Serving

Serving has a different performance shape from training. You are juggling requests, the KV cache, prefill/decode split, batching and scheduling.

- Prefill: lots of prompt tokens in parallel, often compute-heavy.
- Decode: one token at a time, repeatedly reading KV cache, often memory-bound.
- PagedAttention: treat KV cache like paged virtual memory to reduce fragmentation and increase concurrency.

### Resources

- [Fast LLM Inference From Scratch](https://siboehm.com/articles/22/llm-inference) - arithmetic and performance constraints for LLM inference.
- [PagedAttention](https://arxiv.org/abs/2309.06180) - KV-cache paging as virtual memory.
- [Popping the GPU Bubble](https://moondream.ai/blog/popping-the-gpu-bubble) - pipelined decoding and idle compute.
- [Local LLM Inference Optimization: The Complete Guide](https://carteakey.dev/blog/local-inference/local-llm-optimization/) - practical local inference optimization guide.

## Act 7: Quantization, Smaller Bytes and the Right Kernel

If a workload is memory-bound and you cannot move fewer values, move smaller values. Quantization reduces memory footprint and bandwidth demand, but it changes the accuracy and kernel-choice story.

The right kernel depends on the workload. Dequant-then-compute kernels can be good for memory-bound decode; native low-precision GEMM can be better for compute-heavy prefill on new hardware.

### Resources

- [Gemma 4 QAT - Unsloth collection](https://huggingface.co/collections/unsloth/gemma-4-qat) - quantization-aware training model collection.
- [Gemma 4 QAT docs](https://unsloth.ai/docs/models/gemma-4/qat) - Unsloth documentation for QAT models.
- [unsloth/gemma-4-26B-A4B-it-qat-GGUF](https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF/tree/main) - GGUF model repo.
- [The Magic of LLM Distillation](https://www.youtube.com/watch?v=O1AR4iL30mg) - distillation talk, useful background for compression.
- [Tim Dettmers](https://timdettmers.com/) - quantization and efficient training/inference writing.


## Act 8: monokernels and killing boundaries

if kernel boundaries, launch overhead and stragglers waste time, one extreme answer is to fuse much more aggressively. A monokernel/megakernel tries to keep the GPU busy by removing boundaries, loading ahead, and avoiding idle bubbles.

### Resources

- [Designing a Monokernel](https://hazyresearch.stanford.edu/blog/2025-05-27-no-bubbles) - Hazy Research post on no-bubbles/monokernel design.

## Compiler and Runtime Side Quests

Not everything is a Transformer. Tree inference and compiler/runtime work are also part of the performance map when the theme is "make model execution faster."

- [lleaves article](https://siboehm.com/articles/21/lleaves) - compiled LightGBM inference.
- [Simon Boehm's blog](https://siboehm.com/) - CUDA, compiler and performance posts.

## People and Feeds

People whose posts tend to feed this GPU/performance list.

- [Simon Boehm](https://siboehm.com/) - performance, inference and compiler-flavoured ML systems.
- [Horace He](https://horace.io/) - performance models and PyTorch internals.
- [Tri Dao](https://tridao.me/) - attention, sequence models and systems-aware algorithms.
- [Tim Dettmers](https://timdettmers.com/) - quantization and efficient training/inference.
- [Mark Saroufim](https://marksaroufim.substack.com/) - PyTorch, kernels and production ML systems.
- [Jino Rohit](https://x.com/jino_rohit) - distributed systems, Torch and collective communication notes.
- [Ali Taha](https://x.com/waterloo_intern) - model performance and video performance threads.
- [Thien Tran](https://x.com/gaunernst) - GPU kernels and systems notes.
- Daniel Han Chen - Unsloth / model efficiency.
