---
title: Combining WebAssembly and Emulation
author: Sai kumar Murali Krishnan
date: 2021-01-24 
categories: [C]
tags: [webassembly,emulation,C,tutorial]
---

# WebAssembly and Emulation - Chip 8

## Introduction

### WebAssembly
In recent times, deploying compiled languages such as C, Rust and other languages to web pages has been made possible due to WebAssembly. The technology allows for compiled code on a webpage without much code in JavaScript, which this tutorial intends to go through. In my testing, Emscripten was awkward to set up due to the variety of software required, however, proved to be straightforward when compiling.

### Chip-8

Chip-8 is an interpreted system developed in the 1970s and ran on the Chip-8 VM and could run basic video-games, including Pacman (Blinky game), Pong and Space Invaders. It often serves as an excellent introduction to emulation development as there are only 35 opcodes to implement, but still offers a glimpse into how emulators work.

## Building the Emulator

### A roadmap to implementing the emulator
Due to the simplicity of the Chip-8 system, it's a menial job to implement all 35 opcodes. That being said, the job is rather tedious and relies on implementing specific opcodes first. After the opcodes have been implemented, SDL is used to create the screen. The second half of this project then utilises WebAssembly to transpile our code to JavaScript. In summary, a list of tasks to develop this emulator include:

1. Develop a system that can read in ROM files, and match opcodes with their instructions.
2. Implement all 35 opcodes for the system. At this point, you may or may not have a graphical interface going, but its ideal to implement each opcode then test graphically later.
3. Implement a graphical interface that reads from the interpreter memory and draws accordingly. At this point, if any instructions are malfunctioning, ensure you implement various checks.
4. add keyboard support. At this point, the emulator is complete on its own.

### Opcode Matching

A chip-8 ROM consists of readable opcodes and segments with data. Assuming your instructions are appropriately implemented, these data segments shouldn't be processed by the opcode handler. For implementing opcodes, I used Cowgod's Chip-8 reference. They come in several formats, with various bits of data attached to them. For the sake of demonstration, `t` is a placeholder character.

- `tnnn`, or an address. `nnn` corresponds to an address and is typically used for function return/jumping. For instance, `0nnn` tells the interpreter to jump to address `nnn`.
- `tXtt`. The letter x talks about the V register X, or more commonly `V_X`. The interpreter could do several things with a register specified. Consult the reference for this information.
- `ttYt`. The letter `y` talks about the V register y (`V_Y`). This instruction appears when you're working with two registers.
- `tttN`. The letter n represents a single hexadecimal character.
- `ttKK`. Similar to n, but 8 bits over 4 bits.
  
The standard method of detecting which opcode to use involves bitwise operations. In hexadecimal, we have some useful results. Suppose the hexadecimal representation of a number A has two digits. Then:
```C
int A = 0x23;
int B;
B = A & 0x0F;
printf("%x",B); // -> 0x3
```
We find a significant result: the bitwise `&` operation can effectively mask digits so you can use a switch for them. There are two critical takeaways:

1. Any digit that is bitwise ANDed with 0 will result in 0. You may verify this with the binary representations of both numbers.
2. Any digit that is bitwise ANDed with F will result in the digit itself. For instance, `E & F` in base 2 is:

`
0b1110 & 0b1111 = 0b1110
`

The last important operation is the SLL and SLR operations. For instance, you may wish to extract the value of the register for some instruction `tXtt`. `tXtt & 0F00 = 0X00`. The value is in the wrong position and needs to be shifted 2 bits to the left, so using SLL will give you `000X`, which can finally be used.

### Using a Chip-8 reference

While developing this emulator, I consulted with [CowGod's Chip-8 reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM) and implemented each opcode according to the pseudocode instructions. Alongside the opcode reference, I was able to determine the interpreter's display and internal memory with the technical specifications provided.

### Debugging Process

When testing the emulator, I utilised a test ROM [https://github.com/corax89/chip8-test-rom](https://github.com/corax89/chip8-test-rom) to test necessary opcodes. Of course, not every opcode was guaranteed to be functional, so I ensured that the current opcode and next opcode would be printed. This way, I could use a hex viewer (VSCode hex viewer extension or HxD) to decipher the instruction and see the intended behaviour manually. Of course, this all depends on selecting a few core opcodes functional such as screen drawing and function calls. One example of having to debug faulty execution was finding the program halted early due to an unknown opcode instruction. The first task would be to find the opcode location via a hex viewer, then attempting to decode the neighbouring opcodes to see if I was working with code that wouldn't skip or jump to a region properly.


### Taking use of SDL2

SDL2 is designed for peripheral interaction, and drawing graphics and our emulator will need to update keypress information when a key is pushed up or down, and redraw the screen when necessary. A large chunk of the code is just for modifying the display following a screen update whereas the keyboard interaction logic relies on the `SDL_PollEvent` function, which checks to see if anything has been pressed.

### Preparing for WASM

Conveniently, SDL2 has support for WASM and works seamlessly with a simple change for the build command. By providing the argument `-s USE_SDL=2`, `emcc` compiles with SDL in mind. However, the code itself requires some modification for web-deployment, as functions are not called forever in a browser, but rather periodically. Below is the code you need to insert in the `main` function:

```C
#ifdef __EMSCRIPTEN__
    emscripten_set_main_loop(main_loop,0,1);
#endif
```

The function `main_loop` ideally should detect a keypress then emulate one cycle before pausing for some amount of time. At this point, you should be ready to run the application in a web browser. After compiling `HTML` and `js` files, run the following in a terminal, preferably in the folder of compilation:

```
python -m HTTP.server 8080
```
Of course, the last argument can be any port. You may now head to `http://localhost:8080` to find that the application should load up with the emulator. If it does not, open the web console and check for errors, as they correspond to the same error-codes you programmed into your emulator.



## Conclusion

## Overall thoughts
While the initial Emscripten process proved to be lengthy and convoluted for beginners, the end-results were impressive, considering any knowledge of JavaScript was not required to get an emulator going. While the language of choice was inconsequential in the compilation to WASM, utilising a language such as Rust would have made testing considerably more manageable in unit tests, which is doable on C; however, unit testing and module management are modern on Rust in comparison.

### Future Considerations

Some JS and HTML knowledge is required to implement a drop-down menu for changing ROMs to increase useability. Additionally, having a view of registers and the RAM could also be interesting to implement.
