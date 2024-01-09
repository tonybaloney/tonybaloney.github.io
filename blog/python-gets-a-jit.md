blog_heading: Python 3.13 gets a JIT
blog_subheading: Reviewing the JIT in Python 3.13
blog_header_image: posts/snake_cookie_cutter.jpeg
blog_author: Anthony Shaw
blog_publish_date: January 9, 2023
blog_card_image: posts/snake_cookie_cutter.jpeg
---

Happy New Year everyone! In late December 2023 (Christmas Day to be precise), CPython core developer [Brandt Bucher](https://github.com/brandtbucher) submitted a [little pull-request to the Python 3.13](https://github.com/python/cpython/pull/113465) branch adding a JIT compiler.

This change, once accepted would be one of the biggest changes to the CPython Interpreter since the Specializing Adaptive Interpreter added in Python 3.11 (which was also from Brandt).

In this blog post, we're going to have a look at this JIT, what it is, how it works and what the benefits are.

## What is a JIT?

JIT, or "Just in Time" is a compilation design that implies that compilation happens on demand when the code is run the first time. It's a very broad term that could mean many things. I guess, technically the Python compiler is already a JIT because it compiles from Python code into Bytecode.

What people _tend_ to mean when they say a JIT compiler, is a compiler that emits **machine code**. This is in contrast to an AOT (Ahead of Time) compiler, like the GNU C compiler, GCC or the Rust compiler rustc which generates the machine code once and distributes as a binary executable.

When you run Python code, it is first compiled into bytecodes. There are plenty of talks and videos about this process online so I don't want to rehash this too much, but what is important to note about Python bytecodes is:

1. They mean nothing to the CPU and require a special bytecode interpreter loop to execute
1. They are high level and can equate to 1000's of machine instructions
1. They are type agnostic
1. They are cross-platform

For a very simple Python function `f()` that defines a variable `a` and assigns the value `1`:

```python
def func():
    a = 1
    return a
```

It compiles to 5 bytecode instructions, which you can see by running `dis.dis`:

```python
>>> import dis
>>> dis.dis(f)
 34           0 RESUME                   0

 35           2 LOAD_CONST               1 (1)
              4 STORE_FAST               0 (a)

 36           6 LOAD_FAST                0 (a)
              8 RETURN_VALUE
```

I have a more interactive disassembler called [dissy](https://github.com/tonybaloney/dissy) as well if you want to try something more complicated.

For this function, Python 3.11 compiled into the instructions `LOAD_CONST`, `STORE_FAST`, `LOAD_CONST`, and `RETURN_VALUE`. These instructions are interpreted when the function is run by a massive loop written in C.

If you were to write a very crude Python evaluation loop in Python equivalent to the one in C, it would look something like this:

```python
import dis

def interpret(func):
    stack = []
    variables = {}
    for instruction in dis.get_instructions(func):
        if instruction.opname == "LOAD_CONST":
            stack.append(instruction.argval)
        elif instruction.opname == "LOAD_FAST":
            stack.append(variables[instruction.argval])
        elif instruction.opname == "STORE_FAST":
            variables[instruction.argval] = stack.pop()
        elif instruction.opname == "RETURN_VALUE":
            return stack.pop()


def func():
    a = 1
    return a
```

If you gave this interpreter our test function, it would execute them and print the results:

```python
print(interpret(func))
```

This loop with a big switch/if-else statement is an equivalent, albeit simplified version of how CPython's interpreter loop works. CPython is written in C and compiled by a C compiler. For the sake of simplicity I'll build out this example in Python.

For our interpreter, everytime you want to run the function, `func` it has to loop through each instruction and compare the bytecode name (called the opcode) with each if-statement. Both this comparison and the loop itself add an overhead to the execution. That overhead seems redundant if you run the function 10,000 times and the bytecodes never change (because they are immutable). It would be more efficient to instead generate the code in a sequence instead of a evaluating this loop every time you call the function.

This is what a JIT does. There are many types of JIT compiler. Numba is a JIT. PyPy has a JIT. Java has lots of JITs. Pyston and Pyjion are JITs.

The JIT that is proposed for Python 3.13 is a copy-any-patch JIT.

## What is a copy-and-patch JIT?

Never heard of a copy-and-patch JIT? Don't worry, nor had I and nor have most people. It's an idea [only proposed recently in 2021](https://dl.acm.org/doi/10.1145/3485513) and designed as a fast algorithm for dynamic language runtimes.

I'll try and explain what a copy-and-patch JIT is by expanding our interpreter loop and rewriting it as a JIT. Before, the interpreter loop did two things, first it interpreted (looked at the bytecode) then it executed (ran the instruction). What we can do instead is to seperate those tasks and have the interpreter output the instructions and not execute them.

A **copy-and-patch** JIT is the idea that you **copy** the instructions for each command and fill-in-the-blanks for that bytecode arguments (or **patch**). Here's a rewritten example, I keep the loop very similar but each time I append a code string with the Python code to execute:

```python
def copy_and_patch_interpret(func):
    code = 'def f():\n'
    code += '  stack = []\n'
    code += '  variables = {}\n'
    for instruction in dis.get_instructions(func):
        if instruction.opname == "LOAD_CONST":
            code += f'  stack.append({instruction.argval})\n'
        elif instruction.opname == "LOAD_FAST":
            code += f'  stack.append(variables["{instruction.argval}"])\n'
        elif instruction.opname == "STORE_FAST":
            code += f'  variables["{instruction.argval}"] = stack.pop()\n'
        elif instruction.opname == "RETURN_VALUE":
            code += '  return stack.pop()\n'
    code += 'f()'
    return code
```

This result for the original function is:

```python
def f():
  stack = []
  variables = {}
  stack.append(1)
  variables["a"] = stack.pop()
  stack.append(None)
  return stack.pop()
f()
```

This time, the code is **sequential** and doesn't require the loop to execute. We can store the resulting string and run it as many times as we like:

```python
compiled_function = compile(copy_and_patch_interpret(func), filename="<string>", mode="exec")

print(exec(compiled_function))
print(exec(compiled_function))
print(exec(compiled_function))
```

What was the point in that? Well the resulting code does the same thing, but it should run faster. I gave the two implementations to [rich bench](https://pypi.org/project/richbench/) and the copy-and-patch method runs 22x faster.

## Why a copy-and-patch JIT?

This technique of writing out the instructions for each bytecode and patching the values has upsides and downsides compared to a "full" JIT compiler. A full JIT compiler would normally compile high-level bytecodes like `LOAD_FAST` into lower level instructions in an IL (Intermediate Language). Because every CPU architecture has different instructions and features, it would be monumentally-complicated to write a compiler that converts high-level code directly to machine code and supports 32-bit and 64-bit CPUs, as well as Apple's ARM architecture as well as all the other flavours of ARM. Instead most JIT's compile first to an IL that is a generic machine-code-like instruction set. Those instructions are things like "PUSH A 64-bit integer", "POP a 64-bit float", "MULTIPLY the values on the stack". The JIT can then compile IL into machine-code at runtime by emitting CPU-specific instructions and storing them in memory to be later executed (similar to how we did in our example).

Once you have IL, you can run all sorts of fun optimizations on the code like [constant propagation](https://en.wikipedia.org/wiki/Constant_folding) and loop hoisting. You can see an example of this in [Pyjion's live compiler UI](https://live.trypyjion.com).

The big downside with a "full" JIT is that the process of compiling once into IL and then again into machine code is **slow**. Not only is it slow, but it is memory intensive. To illustrate this, data from recent research ["Python meets JIT compilers: A simple implementation and a comparative evaluation"](https://doi.org/10.1002/spe.3267) showed that Java-based JITs for Python like GraalPy, and Jython can take up to 100 times longer to start than normal CPython and consume up to an additional Gigabyte of RAM to compile. There are already full JIT implementations for Python.

Copy-and-patch was selected because the compilation from bytecodes to machine code is done as a set of "templates" that are then stitched together and patched at runtime with the correct values. This means that your average Python user isn't running this complex JIT compiler architecture inside their Python runtime. Python writing it's own IL and JIT would also be unreasonable since so many are available off-the-shelf like LLVMs and ryuJIT. But a full-JIT would require those being bundled with Python and all the added overheads. A copy-and-patch JIT only requires the LLVM JIT tools be installed on the machine where CPython is compiled from source, and for most people that means the machines of the CI that builds and packages CPython for python.org.

## So how does this JIT work?

The copy-and-patch compiler for Python works by extending some new (and honestly not widely known about) APIs to Python 3.13's API. These changes enable pluggable optimizers to be discoverable at runtime in CPython and control how code is executed. This new JIT is an optional optimizer for this new architecture. I assume that it will be the default in future versions once the major bugs have been squashed. 

When you compile CPython from source, you can provide a flag `--enable-experimental-jit` to the configure script. This will generate machine-code templates for the Python bytecodes. This happens by first copying the C code for each bytecode, for example for LOAD_CONST, the simplest:

```c
frame->instr_ptr = next_instr;
next_instr += 1;
INSTRUCTION_STATS(LOAD_CONST); // Not used unless compiled with instrumentation
PyObject *value;
value = GETITEM(FRAME_CO_CONSTS, oparg);
Py_INCREF(value);
stack_pointer[0] = value;
stack_pointer += 1;
DISPATCH();
```

The instructions for this bytecode are first compiled by the C compiled into a little shared library and then stored as machine code. Because there are some variables normally determined at runtime, like `oparg`, the C code is compiled with those parameters left as `0`. There is then a list of the 0 values that need to be filled in, called holes. For `LOAD_CONST`, there are 2 holes to be filled , the oparg and the next instruction:

```c
static const Hole _LOAD_CONST_code_holes[3] = {
    {0xd, HoleKind_X86_64_RELOC_UNSIGNED, HoleValue_OPARG, NULL, 0x0},
    {0x46, HoleKind_X86_64_RELOC_UNSIGNED, HoleValue_CONTINUE, NULL, 0x0},
};
```

All of the machine code is then stored as a sequence of bytes in the file `jit_stencil.h` which is automatically generated by a new build stage. The disassembled code is stored as a comment above each bytecode template, where `JIT_OPARG` and `JIT_CONTINUE` are the holes to be filled:

```asm
0000000000000000 <__JIT_ENTRY>:
pushq   %rbp
movq    %rsp, %rbp
movq    (%rdi), %rax
movq    0x28(%rax), %rax
movabsq $0x0, %rcx
000000000000000d:  X86_64_RELOC_UNSIGNED        __JIT_OPARG
movzwl  %cx, %ecx
movq    0x28(%rax,%rcx,8), %rax
movl    0xc(%rax), %ecx
incl    %ecx
je      0x3d <__JIT_ENTRY+0x3d>
movq    %gs:0x0, %r8
cmpq    (%rax), %r8
jne     0x37 <__JIT_ENTRY+0x37>
movl    %ecx, 0xc(%rax)
jmp     0x3d <__JIT_ENTRY+0x3d>
lock
addq    $0x4, 0x10(%rax)
movq    %rax, (%rsi)
addq    $0x8, %rsi
movabsq $0x0, %rax
0000000000000046:  X86_64_RELOC_UNSIGNED        __JIT_CONTINUE
popq    %rbp
jmpq    *%rax
```

The new JIT compiler, will when activated copy the machine-code instructions for each bytecode into a sequence and replace the values for each template with the arguments for that bytecode in the code object. The resulting machine code is stored in memory and then each time the Python function is run, that machine-code is executed directly.

You can see the JITted code if you compile [my branch](https://github.com/brandtbucher/cpython/pull/32) and try it on this [test script](https://gist.github.com/tonybaloney/7e12e416ad69968e297547498f7bcde1) then give it to a disassembler like Ada Pro or Hopper. At the moment,  the JIT is only used if the function contains the `JUMP_BACKWARD` opcode which is used in the `while` statement but that will change in the future.

## Is it faster?

The initial benchmarks show something of [a 2-9% performance improvement](https://github.com/python/cpython/pull/113465#issuecomment-1876225775). You might be disappointed by this number, especially since this blog post has been talking about assembly and machine code and nothing is faster than that right? Well, remember that CPython is already written in C and that was already compiled to machine-code by the C compiler. In most cases, this JIT will be executing almost the same machine-code instructions as it was before.

**However**, think of this JIT as being the cornerstone of a series of much larger optimizations. None of which are possible without it. For this change to be accepted, understood and maintained in an open-source project it needs to start simple.

## The future is bright, the future is JIT compiled

The challenges with the existing interpreter being compiled ahead-of-time are that there are fewer opportunities for serious optimizations. Python 3.11's adaptive interpreter was a step in the right direction, but it needs to go a lot further for Python to see a step-change in performance. 

I think that whilst the first version of this JIT isn't going to seriously dent any benchmarks (yet), it opens the door to some huge optimizations and not just ones that benefit the toy benchmark programs in the standard benchmark suite. 