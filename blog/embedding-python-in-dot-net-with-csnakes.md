blog_heading: Embedding Python into your .NET project with CSnakes
blog_subheading: A deep-dive into a new integration between .NET and Python
blog_header_image: posts/snake-robot-back.jpg
blog_card_image: posts/snake-robot.jpeg
blog_author: Anthony Shaw
blog_publish_date: October 4, 2024
----------------------------------

This year, I've been working on a new project called [CSnakes](https://tonybaloney.github.io/CSnakes). It's a new way to embed Python into your .NET project. It's a deep integration that allows you to run Python code from within your .NET application without having to shell out to a separate process or use a REST API.

## What problem is this solving?

Python and .NET are pretty different platforms in many ways. Python uses dynamic typing, while .NET uses static typing. Python is interpreted, while .NET is compiled. Python is a language, while .NET is a framework (as my colleague who keeps mentioning F#.NET likes to remind me).

Because of this and many other differences, Python and .NET have taken hold in different parts of the software development world. Python is popular in data science, machine learning, and web development, while .NET is popular in enterprise software, desktop applications, and games.

In Python, you can just about write games on the level of a [NES emulator](https://pypi.org/project/nes-py/), whereas .NET is used to build the [Unity game engine](https://unity.com/) for games like [Hollow Knight](https://www.hollowknight.com/) and Wasteland 3:

![Wasteland 3 screenshot](/img/posts/wasteland3_1.jpg){.img-responsive .center-block style="width:50%"}

On the flip side, Python has been used for some of the biggest scientific breakthroughs of the past 10 years. Python is used for the [James Webb Space Telescope](https://www.youtube.com/watch?v=TLaRrGSQ9rg&list=PL8uoeex94UhE2pLJUo9ouV0h5yRtt3CAG&index=2), was used to create the first images of a blackhole, and is used for the [CERN Large Hadron Collider](https://cds.cern.ch/record/2809574#:~:text=In%202019%2C%20Python%20was%20adopted%20as%20an%20officially,supported%20language%20for%20interacting%20with%20CERN%E2%80%99s%20accelerator%20controls.).

In my opinion, when you pick a programming language for a project, the ecosystem is just as (if not more) important than the language itself. 

You technically _could_ write a 3D game in Python, but you'd be missing out on the Unity engine and all of the graphics card support. You _could_ write a data science application in C#, but you'd be missing out on 10,000's of libraries and their respective commuities. If you start with a language that has a strong ecosystem for the types of problems you're trying to solve, you'll be able to move faster (and have more fun).

So sometimes, you need to use more than one language for an application. This is the case a lot of large applications. I work at Microsoft. Sure, we use a lot of .NET, but we also use Python, Go, C++, Java, C, TypeScript, etc.

That's where CSnakes comes in. You have a .NET project and you want to leverage some of the value from the Python ecosystem.

CSnakes is a .NET library for loading and embedding Python into your .NET application so that you can call Python functions, pass data back and forth without having to write an API between the two. 

The scenarios I've prioritized are data science, machine learning, and scientific computing related because that's one of Python's biggest strengths. You can use CSnakes to embed pretty much anything you can do in Python into .NET (even a web app like Django).

## What do you mean by "embedded"?

The most popular (by far) runtime for Python is CPython. CPython is written in C. CPython comes with a large extensibility layer called the Python C API. This API is mostly designed so that you can write Python libraries in C, C++, and Rust. NumPy for example is written in a combination of C and Python. Pydantic, the model validation platform is a lot of modern APIs is written in Python and Rust. 

This is one of Python's biggest strengths, to allow developers to write high-performance code in C, C++, or Rust and then expose it to Python developers with a nice friendly module that can be installed in a single command.

CSnakes _embeds_ Python into .NET at the C level. (that's where the name comes from). If you call a Python function from .NET using CSnakes, you're making the same C calls that Python would make normally from it's own interpreter. The benefit of this is two-fold. Firstly, the performance is much better than shelling out to a separate process. Secondly, you can pass data back and forth between Python and .NET without having to serialize it to a format like Pickle, JSON, or Protobuf.

### A short example

Let's start with the basics. You have a Python module with a function and you want to call that from .NET:

```python
# example.py

def this_is_a_demo(name: str, star_sign: Optional[str] = None) -> str:
    if star_sign:
        return f"Hello {name}, you're a {star_sign}"
    return f"Hello {name}, you're a mystery"
```

So, to call this from .NET you install the `CSnakes.Runtime` package from NuGet into your project. [You then mark the Python file for analysis in the C# project](https://tonybaloney.github.io/CSnakes/getting-started/#marking-files-for-generation).

Then the next time you build the project, CSnakes will parse the Python code looking for functions at a module level and their **type annotations**. The type annotations (whilst not required) are important because CSnakes uses these to determine what wrapper function in .NET to create.

For `this_is_a_demo` it will create a method with the signature:

```csharp
public string ThisIsADemo(string name, string starSign = null);
```

CSnakes generates a C# class that wraps the Python function. You can then call this from your .NET code:

```csharp
var env = app.Services.GetRequiredService<IPythonEnvironment>();

var module = env.Example();  // This is the example.py module

var result = module.ThisIsADemo("Anthony", "Leo"); // All the public functions are available on the module
Console.WriteLine(result); // Hello Anthony, you're a Leo
```

#### What's happening under the hood?

CSnakes initiates an instance of embedded Python via the C API into the .NET process. We use a singleton in the Service Host environment as the mechanism so that it's easy to resolve a Python environment quickly. 

The CSnakes source generator creates a typed interface and a concrete implementation based on the Python module and the functions it finds. CSnakes has a basic Python parser so we can find the functions and their type annotations without having to spin up Python. You can use CSnakes without the source generator, but it automates the creation of all the boilerplate code for you.

CSnakes also generates wrapper method for the target (`this_is_a_demo`) that handles:

- Loading the module
- Loading the callable object (the function)
- Converting the arguments to Python objects
- Calling the Python function
- Handling any Python exceptions and converting them to .NET exceptions
- Converting the return value to a .NET object

We do all of these steps in C# using the Python C API, and in the most efficient way possible. The type annotations from Python are used by CSnakes to generate a readable, type-safe wrapper method in C#. They're also used to generate the fastest possible conversion code between Python and .NET types. Since type annotations are not guaranteed in Python, CSnakes will handle scenarios such as missing annotations, incorrect annotations, and more.

### A better example

Take this example-- you want to leverage a Python library to analyse some data using an ML [algorithm like K-Means](https://scikit-learn.org/stable/modules/clustering.html#k-means). You have lots of options in Python, like scikit-learn, TensorFlow, PyTorch, etc. You select scikit-learn because it's easy to use and doesn't have too many dependencies. K-Means classifies data points into clusters based on their similarity. It then returns `n` clusters with the center (centroids):

![K-Means](https://scikit-learn.org/stable/_images/sphx_glr_plot_kmeans_digits_001.png){.img-responsive .center-block style="width:50%"}

To use this algorithm in CSnakes, you first write a Python function with a simple type signature because the `kmeans` API for scikit-learn is complicated and exposing it directly would require a lot more boilerplate code on the .NET side.

K-Means uses a Matrix of data points and returns a list of cluster assignments and the interia:

```python
from sklearn.cluster import k_means
import numpy as np
from typing_extensions import Buffer

def calculate_kmeans_inertia(data: list[tuple[int, int]], n_clusters: int) -> tuple[Buffer, float]:
    # Demo data
    X = np.array(data)
    centroid, _, inertia = k_means(
        X, n_clusters=n_clusters, n_init="auto", random_state=0
    )
    return centroid, inertia
```

This next example is a bit more complicated because the function takes a list of tuples and returns both a Buffer (I will explain why later) and a float (the interia).

Since CSnakes uses embedded CPython, you can use libraries like numpy, scikit-learn, TensorFlow, PyTorch, etc. You provide 2 extra calls to the Python environment builder (`WithVirtualEnvironment()` and `WithPipInstaller()`) to install the required packages into a Virtual Environment. CSnakes will then use this environment to run the Python code.

CSnakes generates a method signature for the Python function that has the closest equivalent to `list[tuple[int, int]]`, which is `IReadOnlyList<(long, long)>`. This gives you a simple, type-safe way of defining your input martrix:

```csharp
var env = app.Services.GetRequiredService<IPythonEnvironment>();

// Get the centroids and inertia of a test matrix from scikit-learn kmeans algorithm
var kmeansExample = env.KmeansExample();
List<(long, long)> data = [
    (1, 2), (1, 4), (1, 0),
    (10, 2), (10, 4), (10, 0)
];
```

The result is a tuple of a Numpy array and a float, so CSnakes converts that into a C# tuple, you can use a value tuple to simply assign the resulting components to two variables:

```csharp
var (centroids, inertia)= kmeansExample.CalculateKmeansInertia(data, 4);
```

`interia` is a double-precision floating point number (`double`) and `centroids` is a `Buffer` object. The `Buffer` object is a special type in CSnakes uses Python's Buffer API to read directly from the internal memory of an array-like object. We use Buffer here because numpy arrays don't store numerical data using Python objects, they store it in a C array. We could use a call like `.tolist()` on the numpy array, but since C# and the Numpy arrays numerical data structures are compatible, we can use the Buffer API to read directly from the memory of the numpy array and convert that into a Read-Only Span in C#. This [method provides a zero-copy API to access the data inside an n-dimensional numpy array](https://tonybaloney.github.io/CSnakes/buffers/):

```csharp
var resultMatrix = centroids.AsReadOnlySpan2D<double>();
Console.WriteLine($"KMeans inertia is {inertia}, centroids are:");
for (int i = 0; i < resultMatrix.Height; i++)
{
    for (var j = 0; j < resultMatrix.Width; j++)
    {
        Console.Write(resultMatrix[i, j].ToString().PadLeft(10));
    }
    Console.Write("\n");
}
```

There is also a single-dimension equivalent (`AsReadOnlySpan<T>`) and if you're feeling adventurous, you can use the `AsSpan<T>` method to get a read-write span. This means that from C#.NET you can modify the data in the numpy array directly.

From .NET 9, an experimental `TensorSpan` API is available, so if you're trying .NET 9 you can work with arrays beyond 2 dimensions. [Docs](https://tonybaloney.github.io/CSnakes/buffers/#n-dimensional-buffers-net-9)

## Can I use this in a web app?

Yes, absolutely. We've got a demo specifically for that in the [CSnakes repo](https://github.com/tonybaloney/CSnakes/tree/main/samples/Aspire) that wraps a Python module for analysing weather data from Seattle (spoiler alert - it rains a lot) into a REST API using ASP.NET and .NET Aspire. This demo also includes a demonstration of how to use Open Telemetry so that all logs and traces from Python are within the same trace as the .NET code. [See my other blog post on how to acheive this](/posts/using-dotnet-aspire-dashboard-for-python-opentelemetry.html)


## How does this compare with other projects that integrate Python and .NET

The closest projects to this are:

- [**IronPython**](https://ironpython.net/): IronPython is a .NET implementation of Python. It's a full Python interpreter written in C# that runs on the .NET runtime. Because IronPython is a full interpreter, it isn't compatible with most C extensions. Also, it hasn't been maintained in a while so isn't compatible with modern Python versions, or the latest .NET versions.
- [**Python.NET**](https://github.com/pythonnet/pythonnet) There are some similarities, such as Python.NET has a wrapper around the Python C-API. However, CSnakes comes with a Source Generator to create an interop layer automatically between the two platforms and handle the type conversions based on the type hints in the Python code. Python.NET's main focus is the integration the other way around (calling .NET from Python). We've also made some different design decisions, such as how we handle the GIL.
- [**Pyjion**](https://tonybaloney.github.io/posts/running-python-on-dotnet-5-with-pyjion.html) Pyjion is a JIT for Python that uses the .NET JIT and ECMA335 CIL to compile Python code to machine code. It doesn't make calling Python from .NET any easier, it was designed as a way of making Python faster. But now Python has it's own JIT so it's not really needed anymore.

## What about the GIL?

Python has a Global Interpreter Lock (GIL) that prevents multiple threads from executing Python bytecodes at once. This is because most of Python's internal implementation isn't thread-safe and it simplifies multithreading for Python developers.
.NET on the other hand uses Managed Threads a __lot__. The .NET runtime is very efficient at spawning and managing threads. Also, the TAP (Task-based Asynchronous Pattern) in .NET is very efficient at managing asynchronous code.

We've built a bridge between these two paradigms into CSnakes so that you don't need to worry about the GIL. CSnakes has an internal recursive-lock around the GIL and in cases like the .NET GC collector thread, we queue instructions that require the GIL so that they're handled in a thread-safe way.

CSnakes also [supports the experimental feature in Python 3.13](https://tonybaloney.github.io/CSnakes/advanced/#free-threading-mode) to __disable__ the GIL altogether. You can run "free threaded" Python embedded into .NET, which would provide much greater parallelism and performance. 

## What are the limitations?

We are documenting the limitations of CSnakes on the [Limitations](https://tonybaloney.github.io/CSnakes/limitations/) page. But, some important ones are:

- If the function is async, it won't generate an "async" wrapper in C#. It's possible, but nobody has asked for this yet.
- If the type signature is a Union, either with `typing.Union` or the union operator `|`, CSnakes won't generate a wrapper. C# doesn't have a direct equivalent to Union types, so we're still working on the best way to handle this.
- If the result is a class or the function takes a class, even if that class is defined in something like `dataclasses`, CSnakes will just expose this as a generic `PyObject`. We don't do any kind of reflection for classes (yet). You can access methods, attributes and properties on the class, but they aren't strongly typed.

## How do I get started?

Here's a recap of the CSnakes architecture:

![CSnakes architecture](https://tonybaloney.github.io/CSnakes/res/architecture_simple.png){.img-responsive .center-block style="width:50%"}

CSnakes supports .NET 8 and 9 and Python versions 3.9 to 3.13. It also supports Windows, macOS, and Linux.

Go to the [Getting Started](https://tonybaloney.github.io/CSnakes/getting-started/) guide on the CSnakes website. We have a tutorial that walks you through the process of setting up a new .NET project, installing the CSnakes NuGet package, and writing your first Python function.

## What's next?

We're looking for feedback right now. The API is still in beta, so I'm all ears on the interface, usability and technical constraints and decisions we've made. At .NET Conf this year, I'll be showcasing CSnakes with some interesting demos. 