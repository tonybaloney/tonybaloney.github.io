blog_heading: Writing Python Extensions in Assembly
blog_subheading: A deep-dive technical overview of how you can write CPython extensions in assembly
blog_header_image: posts/hammer-screw.jpeg
blog_author: Anthony Shaw
blog_publish_date: August 15, 2020
----------------------------------

On occasion, you need to take something apart and put it back together to fully understand it. I'm sure many of the people reading this article will have been one of those kids. Kids who will take a screwdriver to something, just to see whats inside it.
It's a thrill, but its a whole different skill to put it back together.

![remote-control-car](/img/posts/remote-control-car.png){: .img-responsive .center-block}

The seamlessly working machine on the outside obscures a network of patterns, patches, and workarounds in its internals.
Programmers are used to working on the guts of a system and changing the ugly-inner workings to coax it into doing what its been told.

This experiment was no different. I wanted to see if I could write a CPython Extension in 100% assembly.

Why? Well, because after finishing the [CPython Internals book](https://realpython.com/cpython-book), the assembly code was still something of a mystery. I started learning x86-64 assembly from Jo Van Hooey's book and understood some of the basic concepts but struggled to relate
them to the high-level languages that I'm familiar with.

## Assembly quick summary

Assembly code is a sequence of instructions, using an instruction set. Different CPU architectures have instruction sets, the most common being x86, ARM, and x86-64.
There are also extension instructions on those CPU architectures. Over releases of a CPU architecture the manufacturers add new instructions to the set. Often to improve performance.

Assembly is a sequence of instructions and you can only copy from memory to a CPU register. The CPU has many registers,

```
mov DESTINATION, SOUCE
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

```assembly
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

### Turning assembly into an executable

You can't execute an assembly source file directly. It may seem like you're coding machine-code, but there is a wrapper around the assembly instructions required to make the OS run the instructions (an Executable File Format).

The assembler will take an assembly source file and assemble it into a machine-code format. The formats are Operating System specific. Some common formats for executable code are:

- [Mach-O](https://en.wikipedia.org/wiki/Mach-O) for macOS
- [ELF](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format) for Linux
- [PE] for Windows

Executable file formats include a few components, not just instructions:

- The machine-code instructions (in a section called `text`)
- A list of external symbols (external references)
- A list of memory requirements (Bytes Started by Sequence, `bss` section)
- Constant values, like strings (in a section called `data`)

EFF headers also contain some other useful information that the Operating System needs.

The Mach-O format contains a detailed header before any data or instructions. I like a program called [SynalizeIT!](https://www.synalysis.net), a HEX Editor that can apply binary grammars to visualize and decode binary file formats.
The Mach-O format is a supported grammar, and if you open up the CPython executable (`/usr/bin/python3` or whereever you've installed it), you can see and explore those headers.

![synalize-screenshot-1](/img/posts/synalize-screenshot-1.png){: .img-responsive .center-block}

On the right, you can see some attributes like:

- The CPU architecture this binary was assembled for. In the future, when Apple release an ARM MacBook, this executable won't work as it will inspect this header and see a mismatch in the CPU architecture (before trying to load the instructions)
- The length, positions and offsets of the data, text and bss sections
- Any runtime flags, such as Position-Independent-Executable (PIE) (covered later)

## Compilation, assembly and linking

## Extending setuptools/distutils

## GitHub CI/CD workflows

##
