blog_heading: Running Python on .NET 5
blog_subheading: An update on the Pyjion project to plug a JIT into CPython
blog_header_image: posts/turtle-pileup.jpg
blog_author: Anthony Shaw
blog_publish_date: November 11, 2020
------------------------------------

.NET 5 was released on November 10, 2020. It is the cross-platform and open-source replacement of the [**.NET Core**](https://github.com/dotnet/core) project and the **.NET** project that ran exclusively on Windows since the late 90's. .NET 5 comes bundled with a performant JIT compiler (codenamed RyuJIT) that will compile .NETs intermediary language, ECMA335 CIL into native machine instructions on Intel x86, x86-64, and ARM CPU architectures.

You can write code in a number of languages, like C++, C#, F# and compile those into CIL and then into native machine code (as a binary executable) on macOS, Linux, and Windows. Pretty neat.

But this is a blog about Python. So what does this have to do with Python?

Pyjion is a project to replace the core execution loop of CPython with JIT compiled functions.

To get started, you need to have .NET 5 installed, with Python 3.9 and the Pyjion package (I also recommend using a virtual environment).

After importing pyjion, enable it by calling `pyjion.enable()` which sets a compilation threshold to 0 (the code only needs to be run once to be compiled by the JIT):

```
>>> import pyjion
>>> pyjion.enable()
```

Any Python code you define or import after enabling pyjion will be JIT compiled. You don't need to execute functions in any special API, its completely transparent:

```
>>> def half(x):
...    return x/2
>>> half(2)
1.0
```

Pyjion will have compiled the `half` function into machine code on-the-fly and stored a cached version of that compiled function inside the function object.
You can see some basic stats by running `pyjion.info(f)`, where `f` is the function object:

```
>>> pyjion.info(half)
{'failed': False, 'compiled': True, 'run_count': 1}
```

You can see the machine code for the compiled function by disassembling it in the Python REPL.
Pyjion has essentially compiled your small Python function into a small, standalone application:

```
>>> import pyjion.dis
>>> pyjion.dis.dis_native(half)
00000000: PUSH RBP
00000001: MOV RBP, RSP
00000004: PUSH R14
00000006: PUSH RBX
00000007: MOV RBX, RSI
0000000a: MOV R14, [RDI+0x40]
0000000e: CALL 0x1b34
00000013: CMP DWORD [RAX+0x30], 0x0
00000017: JZ 0x31
00000019: CMP QWORD [RAX+0x40], 0x0
0000001e: JZ 0x31
00000020: MOV RDI, RAX
00000023: MOV RSI, RBX
00000026: XOR EDX, EDX
00000028: POP RBX
00000029: POP R14
...
```

The complex logic of converting a portable instruction set into low-level machine instructions is done by .NET's compiler.

## What is this? A fork of Python? Another Python runtime?

A few releases of Python ago (CPython specifically, the most commonly used version of Python) in 3.7 a new API was added to be able to swap out "frame execution" with a replacement implementation. This is otherwise known as [PEP 523](https://www.python.org/dev/peps/pep-0523/). PEP 523 also added the capability to store additional attributes in _code objects_ (compiled Python code.

Pyjion does not compile Python code.

CPython compiles the Python code, so whatever language features and behaviours there are in CPython 3.9, like the walrus operator, [the dictionary union operator](https://www.python.org/dev/peps/pep-0584), will all work exactly the same with this extension enabled. This also means that this extension uses the same standard library as Python 3.9.

Pyjion is a "pip installable" package for standard CPython that JIT compiles all Python code at runtime using the .NET 5 JIT compiler. You can use off-the-shelf CPython 3.9 on macOS, Linux or Windows. After installing this package you just import the module and enable the JIT.

All Python code executed after the JIT is enabled will be compiled into native machine code at runtime and cached on disk. For example, to enable the JIT on a simple `app.py` for a Flask web app:

```python
import pyjion
pyjion.enable()

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

app.run()
```

That's it.

## Will this be compatible with my existing Python code? What about C Extensions?

The short answer is- if your existing Python code runs on CPython 3.9 -- **yes** it will be compatible. To make sure, Pyjion has been tested against the full CPython "test suite" on all platforms. In fact, it was the first JIT ever to pass the test suite.

Thats because this isn't a Python runtime, it uses the existing Python compiler to compile your code into Python bytecode (low level instructions).

Pyjion uses the same dynamic module loader as CPython, so if you import a Python extension from your virtual environment, it will work just the same in Pyjion.

The way that the Python compiler works

There is a lot more to this. I've written a [whole book on the CPython compiler and the internals of CPython](https://realpython.com/products/cpython-internals-book/) if you want to learn more.

## Project History

There were some limitations to the original project

- Written against an old version of .NET Core
- Required custom patches of .NET and compiling from source
- Required custom patches of CPython and compiling from source
- Only worked on Windows
- It was written for Python 3.6 before PEP 523 was agreed and merged

Has much changed since Python 3.6? To the average user, not really. But under the hood, the implementation of a few things has completely changed:

- Function calls
- Iterators
- Exception Handling
- Dictionary, list and set comprehensions
- Generators and coroutines

Actually, a **lot** has changed in the last few releases of CPython. The patch that I'm talking about to get Pyjion working with the latest version of everything was a big undertaking

![not-much-has-changed](/img/posts-original/not-much-has-changed.png)

##  What is a JIT?

##  Overview of the .NET JIT

![]()

## Pyjion architecture

##  Potential gains and benefits

##  Comparison with other projects

## Debugging and disassembling