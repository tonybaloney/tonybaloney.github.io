blog_heading: Writing Python Extensions in Assembly
blog_subheading: A deep-dive technical overview of how you can write CPython extensions in assembly (with a bonus tutorial on assembly programming)
blog_header_image: posts/hammer-screw.jpeg
blog_author: Anthony Shaw
blog_publish_date: August 15, 2020
----------------------------------

On occasion, you need to take something apart and put it back together to fully understand it. I'm sure many of the people reading this article will have been one of those kids. Kids who will take a screwdriver to something, just to see whats inside it.
It's a thrill, but its a whole different skill to put it back together.

![remote-control-car](/img/posts/remote-control-car.jpg){: style="width:40%"}

The seamlessly working machine on the outside obscures a network of patterns, patches, and workarounds in its internals.
Programmers are used to working on the guts of a system and changing the ugly-inner workings to coax it into doing what its been told.

This experiment was no different. I wanted to see if I could write a CPython Extension in 100% assembly.

Why? Well, because after finishing the [CPython Internals book](https://realpython.com/cpython-book), the assembly code was still something of a mystery. I started learning x86-64 assembly from Jo Van Hooey's book and understood some of the basic concepts but struggled to relate
them to the high-level languages that I'm familiar with.

There are some questions I wanted answers to, like:

- Why do extensions in CPython need to be written in Python or C?
- If Python C extensions compile to shared libraries, whats the magic inside them that makes them loadable by Python?
- What ABI does CPython have between C that could make it more extensible by other languages

## Assembly quick summary

Assembly code is a sequence of instructions, using an instruction set. Different CPU architectures have different instruction sets. With the most common being x86, ARM, and x86-64.
There are also extension instructions on those CPU architectures. Over releases of a CPU architecture the manufacturers add new instructions to the set. Often to improve performance.

The CPU has many registers and it loads data from registers to execute the instructions. You can also copy data from memory (RAM), but you can't copy from RAM to RAM, it must go via a register.
This means that when writing assembly instructions, you need to need to run many steps to accomplish something which would otherwise be done in 1 line in a higher-level language.

For example, to assign a variable `a` to the reference of variable `b` in Python:

```python
a = b
```

Whereas in assembly, you copy first to a register (we'll use RAX) and then to the destination:

```x86asm
mov RAX, a
mov b, RAX
```

The instruction `mov RAX, a` will copy the __address__ of the variable `a` to the register. The register RAX is a **64-bit register**, so it can contain any value which fits into 64 bits (8 bytes).
On a 64-bit Operating System, memory addresses are 64-bit addresses, so the address value will be 64 bits.

You can also copy the __value__ of the variable to the register by using `[]` around the name:

```
mov a, 1
mov RAX, [a]
```

Now the value of the `RAX` register will be the decimal value 1 (`0000 0000 0000 0001` in hexadecimal).

I picked RAX because it's the first register, but you can arbitrary pick any register if you're writing a standalone application.

64-bit registers start with `r`, the first 8 registers can also be used with 32, 16 or 8-bit values by referencing the lower bits of the register. Addressing 32-bits of a register is faster, so most compilers will use a smaller register address if the
value is within 32-bits:

| 64-bit register | Lower 32 bits | Lower 16 bits | Lower 8 bits |
|-----------------|---------------|---------------|--------------|
| rax             | eax           | ax            | al           |
| rbx             | ebx           | bx            | bl           |
| rcx             | ecx           | cx            | cl           |
| rdx             | edx           | dx            | dl           |
| rsi             | esi           | si            | sil          |
| rdi             | edi           | di            | dil          |
| rbp             | ebp           | bp            | bpl          |
| rsp             | esp           | sp            | spl          |
| r8              | r8d           | r8w           | r8b          |
| r9              | r9d           | r9w           | r9b          |
| r10             | r10d          | r10w          | r10b         |
| r11             | r11d          | r11w          | r11b         |
| r12             | r12d          | r12w          | r12b         |
| r13             | r13d          | r13w          | r13b         |
| r14             | r14d          | r14w          | r14b         |
| r15             | r15d          | r15w          | r15b         |

As assembly is a sequence of instructions, branching can be tricky. The way to implement branching is to use conditional and unconditional jump statements to move the instruction pointer (`rip`) to the instruction address.
Instruction addresses can be labeled in the assembly source code and the assembly will replace these names with a actual memory address. This address is either relative or absolute (will be explained later).

```
jmp leapfrog ; jump to leapfrog label
mov rax, rcx ; this never gets executed
leapfrog:
mov rcx, rax
```

This simple Python code, contains a branch when comparing `a` with the decimal value `5`:

```python
a = 2
a += 3
if a == 5:
  print("YES")
else:
  print("NO")
```

You could do this in assembly by simplifying the assignment of (`a` and increment by `3`) into a simple comparison.
Most compilers would make this sort of optimization automatically, because they would determine that you're comparing constant values.

Here is some pseudo-assembly to demonstrate:

```x86asm
 mov rcx, 2  ; Move the decimal value 2 to the RCX CPU register
 add rcx, 3  ; Add 3 to the value in the RCX CPU register, RCX is now equal to 5
 cmp rcx, 5  ; Compare RCX to the value 5, 
 je YES      ; If the comparison was equal, jump to the instruction offset YES
 jmp NO      ; Jump to the instruction offset NO
 YES:  ; RCX == 5
   ... 
   jmp END
 NO:   ; RCX != 5
   ...
   jmp END
```

### Calling external functions

Unless you want to entirely reinvent the wheel, your application or library will probably be using functions from other compiled libraries.

In assembly, you can refer to the address of an external function by using the `extern` instruction with the symbol name.
The linker will replace this with the actual value of the library, if the executable is statically linked, or depend upon a runtime value if the executable is dynamically linked. I don't want to get into linking in this article
otherwise it will keep going into a mini-book (and I don't really know that much about linkers).

If you were writing an application in C and required to call a function in another library, you would use the Header (H) file.

Header files would tell the compiler:

- The name of the function (symbol)
- Its return value and the size of the response
- The arguments and their types

For example, if you defined a function in C:

```c
char* pad_right(char * message, int width, char padding);
```

What this header tells us:
- The function takes 3 arguments
- The first argument is a `char` pointer, so a 64-bit address to an 8-bit value (`char`)
- The second argument is an int, which (depending on the OS and some other factors) is probably a 32-bit value
- The third argument is a `char`, which is 8-bits
- The response is a `char` pointer, so we need a 64-bit address to store the result

Assembly function calls don't have the concept of arguments, but instead Operating Systems define a specification (called a calling convention) on which registers
should be used for which argument.

Luckily, macOS and Linux have the same [calling convention](https://software.intel.com/sites/default/files/article/402129/mpx-linux64-abi.pdf) called System-V for arguments, which states that the following registers should be populated with the values of the arguments when a function is called:

| Argument        | 64-bit Register |
|-----------------|-----------------|
| Argument 1      | rdi             |
| Argument 2      | rsi             |
| Argument 3      | rdx             |
| Argument 4      | rcx             |
| Argument 5      | r8              |
| Argument 6      | r9              |

NB: Windows has a [calling convention](https://docs.microsoft.com/en-us/cpp/build/x64-calling-convention?view=vs-2019), which uses different registers to System-V.

Additional arguments are loaded from the value stack, and because its a value stack you push them in reverse order. For example, if the function had 10 arguments, you would push the 10th first:

```x86asm
 push arg10
 push arg9
 push arg8
 push arg7
```

This calling convention means that if you're calling a function written in C, C++, or even Rust, the function will read whatever is in the `rdi` CPU register and use that as the first argument.

If you wanted to call the `pad_right()` function you would write the equivalent assembly code:

```x86asm
extern pad_right
section .data
    message db "Hello", 0 ; null-terminated string
section .bss
    result  resb 11
section .text
    mov rdi, db  ; argument 1 
    mov rsi, 10  ; argument 2
    mov rdx, '-' ; argument 3
    call pad_right
    mov [result], rax ; result
```

The calling convention states that the register `rax` will be populated with the result. Because this function returns a `char *`, we expect the result to be a pointer (64-bit memory address value).
We reserved 11 bytes (10 letters + null terminator) in the `bss` section and then write the result `rax` to that address.

Something else important to remember is that assembly doesn't have scope. So if you were using a register for something, like storing a value, then called an external function, that register could have changed values.
Registers are effectively global.

The correct way to preserve the state of your registers before calling functions is to push them onto the value stack, then pop them back off when the function call has completed:

```x86asm
... do stuff with r9
push r9
call externalFunction
pop r9
```

When you are building your own functions, its expected that you preserve the call frame during your instructions. The call frame uses the stack pointer (`rsp`) and `rbp` registers.
To accomplish this, assembly functions should include some extra instructions at the beginning and end (called the prolog and epilog):

```x86asm
push rbp
mov rbp, rsp

... your code

mov rsp, rbp
pop rbp
```

Windows defines [another calling convention](https://docs.microsoft.com/en-us/cpp/build/x64-calling-convention?view=vs-2019), using different registers for the arguments.
It also requires a different prolog and epilog, which calculates address limits. This is a bit more complex than the original Intel spec.

### Turning assembly into an executable

You can't execute an assembly source file directly. It may seem like you're coding machine-code, but there is a wrapper around the assembly instructions required to make the OS run the instructions (an Executable File Format).

The assembler will take an assembly source file and assemble it into a machine-code format. The formats are Operating System specific. Some common formats for executable code are:

- [Mach-O](https://en.wikipedia.org/wiki/Mach-O) for macOS
- [ELF](https://refspecs.linuxfoundation.org/elf/elf.pdf) for Linux
- [PE](https://docs.microsoft.com/en-us/windows/win32/debug/pe-format) for Windows

Executable file formats include a few components, not just instructions:

- The machine-code instructions (in a section called `text`)
- A list of external symbols (external references)
- A list of memory requirements (Bytes Started by Sequence, `bss` section)
- Constant values, like strings (in a section called `data`)

EFF headers also contain some other useful information that the Operating System needs.

The Mach-O format contains a detailed header before any data or instructions. I like a program called [SynalizeIT!](https://www.synalysis.net), a HEX Editor that can apply binary grammars to visualize and decode binary file formats.
The Mach-O format is a supported grammar, and if you open up the CPython executable (`/usr/bin/python3` or whereever you've installed it), you can see and explore those headers.

![synalize-screenshot-1](/img/posts/synalize-screenshot-1.png)

On the right, you can see some attributes like:

- The CPU architecture this binary was assembled for. In the future, when Apple release an ARM MacBook, this executable won't work as it will inspect this header and see a mismatch in the CPU architecture (before trying to load the instructions)
- The length, positions and offsets of the data, text and bss sections
- Any runtime flags, such as Position-Independent-Executable (PIE) (covered later)

### Complex data structures in assembly

If you were calling a function that had a more complex data type for its argument (like a pointer to a `struct`), you need to be aware of the storage size
of the C data types:

| Scalar Type             | C Data Type                     | Storage Size (in bytes) | Recommended Alignment |
|-------------------------|---------------------------------|-------------------------|-----------------------|
| INT8                    | `char`                          | 1                       | Byte                  |
| UINT8                   | `unsigned char`                 | 1                       | Byte                  |
| INT16                   | `short`                         | 2                       | Word                  |
| UINT16                  | `unsigned short`                | 2                       | Word                  |
| INT32                   | `int`, `long`                   | 4                       | Doubleword            |
| UINT32                  | `unsigned int`, `unsigned long` | 4                       | Doubleword            |
| INT64                   | `__int64`                       | 8                       | Quadword              |
| UINT64                  | `unsigned __int64`              | 8                       | Quadword              |
| FP32 (single precision) | `float`                         | 4                       | Doubleword            |
| FP64 (double precision) | `double`                        | 8                       | Quadword              |
| POINTER                 | `*`                             | 8                       | Quadword              |

Take this example of a struct in C with 3 integer fields (`x`, `y`, and `z`):

```c
typedef struct { 
    int x; 
    int y;
    int z;
} position
```

Each of those 3 fields would use 4 bytes (32-bits), so if you were to define in C:

```c
position myself = { 3, 9, 0} ;
```

That would equate the variable `myself` to the hexadecimal value:

```
0000 0003 0000 0009 0000 0000
```

You can recreate this structure in NASM assembly using the `struc` and `istruc` macros:

```x86asm
section .data:
    struc position
        x: resd 1
        y: resd 1
        z: resd 1
    endstruc
    
    myself:
        istruc position
            at x, dd 3
            at y, dd 9
            at z, dd 0
        iend
```

The `struc` macro is equivalent to the `struct` construct in C, for defining memory structures. The `istruc` allocates a constant value with the values defined.
The instruction `resd` means to reserve a double word (4 bytes), the `dd` means to define a double word to the value.

This would create the identical memory sequence:

```
0000 0003 0000 0009 0000 0000
```

Because this doesn't fit into 64-bits, you would send a pointer to the address of the allocated memory.

If, in C you had a function that used the typedef:

```c
void calculatePosition(position* p);
```

You could call that function from assembly by setting the `rdi` register to the address of your allocated memory:

```x86asm
mov rdi, myself
call calculatePosition
```

The function, `calculatePosition` is ignorant to whether it's being called by code written in C, Assembly, C++, etc.

Its this principal that I'll explore next to see if we can write a dynamically loaded CPython Extension in Assembly.

## Registering the Python Extension module




```x86asm
default rel
bits 64
%ifdef NOPIE
    %define PYMODULE_CREATE2 PyModule_Create2
%else
    %define PYMODULE_CREATE2 PyModule_Create2 wrt ..plt
%endif
```

```x86asm
section .data
    modulename db "pymult", 0
    docstring db "Simple Multiplication function", 0

    struc   moduledef
        ;pyobject header
        m_object_head_size: resq 1
        m_object_head_type: resq 1
        ;pymoduledef_base
        m_init: resq 1
        m_index: resq 1
        m_copy: resq 1
        ;moduledef
        m_name:	resq	1
        m_doc:	resq	1
        m_size:	resq	1
        m_methods:	resq	1
        m_slots: resq	1
        m_traverse: resq	1
        m_clear: resq	1
        m_free: resq	1
    endstruc

section .bss
section .text
```

```x86asm
global PyInit_pymult
```

```x86asm
PyInit_pymult:
    extern PyModule_Create2
    section .data

        _moduledef:
            istruc moduledef
                at m_object_head_size, dq  1
                at m_object_head_type, dq 0x0  ; null
                at m_init, dq 0x0       ; null
                at m_index, dq 0        ; zero
                at m_copy, dq 0x0       ; null
                at m_name, dq modulename
                at m_doc, dq   docstring
                at m_size, dq 2
                at m_methods, dq 0 ; null - no functions
                at m_slots, dq 0    ; null- no slots
                at m_traverse, dq 0 ; null
                at m_clear, dq 0    ; null - no custom clear
                at m_free, dq 0     ; null - no custom free()
            iend
```

The C code we're trying to recreate is a function called `PyInit_pymult()` that returns a `PyObject*`, which is created by calling `PyModule_Create2()`.

```c
PyObject* PyInit_pymult() {
    return PyModule_Create2(&_moduledef, METH_VARARGS); 
}
```

```x86asm
    section .text
        push rbp                    ; preserve stack pointer
        mov rbp, rsp

        lea rdi, [_moduledef]  ; load module def
        mov esi, 0x3f5              ; 1033 - module_api_version
        call PYMODULE_CREATE2       ; create module, leave return value in register as return result

        mov rsp, rbp ; reinit stack pointer
        pop rbp
        ret
```

Next, to compile the source, we have to assemble the `pymult.asm` file, then link it to the `libpythonXX` library.
This is done in two steps. The first step is to create the object file, using `nasm`. The second step is to link the object file with the Python 3.X (in my case 3.9) library:

```console
nasm -g -f macho64 -DMACOS --prefix=_ pymult.asm -o pymult.obj
cc -shared -g pymult.obj -L/Library/Frameworks/Python.framework/Versions/3.9/lib -lpython3.9 -o pymult.cpython-39-darwin.so
```

This will produce the artifact `pymult.cpython-39-darwin.so` which can be loaded into
Because we build with the debug symbols (the `-g` flag), the lldb or gdb debugger can be used to set a breakpoint in the assembly code.

```console
 $ lldb python3.9
(lldb) target create "python3.9"
Current executable set to 'python3.9' (x86_64).
(lldb) b pymult.asm:128
Breakpoint 2: where = pymult.cpython-39-darwin.so`PyInit_pymult + 16, address = 0x00000001059c7f6c
```

When the module is loaded, lldb will hit the breakpoint. You can start the process with the arguments `-c 'import pymult'` to just import the new module and quit:

```console
(lldb) process launch -- -c "import pymult"
Process 30590 launched: '/Library/Frameworks/Python.framework/Versions/3.9/Resources/Python.app/Contents/MacOS/Python' (x86_64)
1 location added to breakpoint 1
Process 30590 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00000001007f6f6c pymult.cpython-39-darwin.so`PyInit_pymult at pymult.asm:128
   125
   126 	        lea rdi, [_moduledef]  ; load module def
   127 	        mov esi, 0x3f5              ; 1033 - module_api_version
-> 128 	        call PyModule_Create2       ; create module, leave return value in register as return result
   129
   130 	        mov rsp, rbp ; reinit stack pointer
   131 	        pop rbp
Target 0: (Python) stopped.
```

Hooray! The module is being initialized. At this point you can manipulate any of the registers or visualize the data.

```
(lldb) reg r
General Purpose Registers:
       rax = 0x00000001007d3d20
       rbx = 0x0000000000000000
       rcx = 0x000000000000000f
       rdx = 0x0000000101874930
       rdi = 0x00000001007f709a  pymult.cpython-39-darwin.so`..@31.strucstart
       rsi = 0x00000000000003f5
       rbp = 0x00007ffeefbfdbf0
       rsp = 0x00007ffeefbfdbf0
        r8 = 0x0000000000000000
        r9 = 0x0000000000000000
       r10 = 0x0000000000000000
       r11 = 0x0000000000000000
       r12 = 0x00000001007d3cf0
       r13 = 0x000000010187c670
       r14 = 0x00000001007f6f5c  pymult.cpython-39-darwin.so`PyInit_pymult
       r15 = 0x00000001003a1520  Python`_Py_PackageContext
       rip = 0x00000001007f6f6c  pymult.cpython-39-darwin.so`PyInit_pymult + 16
    rflags = 0x0000000000000202
        cs = 0x000000000000002b
        fs = 0x0000000000000000
        gs = 0x0000000000000000
```

You can also inspect the frame and see the frame stack:

```
(lldb) fr info
frame #0: 0x0000000101adbf6c pymult.cpython-39-darwin.so`PyInit_pymult at pymult.asm:128
(lldb) bt
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
  * frame #0: 0x0000000101adbf6c pymult.cpython-39-darwin.so`PyInit_pymult at pymult.asm:128
    frame #1: 0x000000010023326a Python`_PyImport_LoadDynamicModuleWithSpec + 714
    frame #2: 0x0000000100232a2a Python`_imp_create_dynamic + 298
    frame #3: 0x0000000100166699 Python`cfunction_vectorcall_FASTCALL + 217
    frame #4: 0x000000010020131c Python`_PyEval_EvalFrameDefault + 28636
    frame #5: 0x0000000100204373 Python`_PyEval_EvalCode + 2611
    frame #6: 0x00000001001295b1 Python`_PyFunction_Vectorcall + 289
    frame #7: 0x0000000100203567 Python`call_function + 471
    frame #8: 0x0000000100200c1e Python`_PyEval_EvalFrameDefault + 26846
    frame #9: 0x0000000100129625 Python`function_code_fastcall + 101
    ...
```

## Adding a function to the module

```x86asm
    struc methoddef
        ml_name:  resq 1
        ml_meth: resq 1
        ml_flags: resd 1
        ml_doc: resq 1
        ml_term: resq 1
        ml_term2: resq 1
    endstruc

    method1name db "multiply", 0
    method1doc db "Multiply two values", 0

    _method1def:
        istruc methoddef
            at ml_name, dq method1name
            at ml_meth, dq PyMult_multiply
            at ml_flags, dd 0x0001 ; METH_VARARGS
            at ml_doc, dq 0x0
            at ml_term, dq 0x0 ; Method defs are terminated by two NULL values,
            at ml_term2, dq 0x0 ; equivalent to qword[0x0], qword[0x0]
        iend
```

```x86asm
global PyMult_multiply

PyMult_multiply:
    ;
    ; pymult.multiply (a, b)
    ; Multiplies a and b
    ; Returns value as PyLong(PyObject*)
    extern PyLong_FromLong
    extern PyLong_AsLong
    extern PyArg_ParseTuple
    section .data
        parseStr db "LL", 0 ; convert arguments to Long, Long
    section .bss
        result resq 1 ; long result
        x resq 1      ; long input
        y resq 1      ; long input
    section .text
        push rbp ; preserve stack pointer
        mov rbp, rsp
        push rbx
        sub rsp, 0x18

        mov rdi, rsi                ; args
        lea rsi, [parseStr]    ; Parse args to LL
        xor ebx, ebx                ; clear the ebx
        lea rdx, [x]           ; set the address of x as the 3rd arg
        lea rcx, [y]           ; set the address of y as the 4th arg

        xor eax, eax                ; clear eax
        call PYARG_PARSETUPLE       ; Parse Args via C-API

        test eax, eax               ; if PyArg_ParseTuple is NULL, exit with error
        je badinput

        mov rax, [x]                ; multiply x and y
        imul qword[y]
        mov [result], rax

        mov edi, [result]           ; convert result to PyLong
        call PYLONG_FROMLONG

        mov rsp, rbp ; reinit stack pointer
        pop rbp
        ret

        badinput:
            mov rax, rbx
            add rsp, 0x18
            pop rbx
            pop rbp
            ret
```

## Extending setuptools/distutils

## GitHub CI/CD workflows

##
