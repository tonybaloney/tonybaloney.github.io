blog_heading: Python has had async for 10 years -- why isn't it more popular?
blog_subheading: A deep-dive into the challenges and misconceptions surrounding async programming in Python
blog_header_image: posts/fishing-2015.jpg
blog_author: Anthony Shaw
blog_publish_date: August 29, 2025
blog_card_image: posts/fishing-2015.jpg
---

The [Python Documentary](https://www.youtube.com/watch?v=GfH4QL4VqJ0&pp=ygUScHl0aG9uIGRvY3VtZW50YXJ5) dropped this morning. In the middle of the documentary, there's a dramatic segment about how the transition from Python 2 to 3 divided the community (spoiler alert: it didn't in the end).

The early versions of Python 3 (3.0-3.4) were mostly focused on stability and offering pathways for users moving from 2.7. Along came 3.5 in 2015 with a new feature: [`async` and `await` keywords for executing coroutines](https://peps.python.org/pep-0492/).

What is now ten years and 9 releases of Python later, Python 3.14 is shipping in weeks. 

Whilst everyone will be distracted by the shiny colorful REPL features in 3.14, there are some big announcements nestled in the release notes. Both related to concurrency and parallelism

![Colorful REPL](/img/posts/colorful-repl.png)

1. [PEP779 Free-Threading is Officially Supported](https://docs.python.org/3.14/whatsnew/3.14.html#pep-779-free-threaded-python-is-officially-supported). 
1. [PEP 734: Multiple interpreters in the stdlib](https://docs.python.org/3.14/whatsnew/3.14.html#pep-734-multiple-interpreters-in-the-stdlib)

Both of these features are huge advancements in how Python can be used to execute concurrent code. But if `async` has been here for 10 years, why do we need them?

The killer use-case for async is web development. Coroutines lend well to out-of-process network calls, like HTTP requests and database queries. Why block the entire Python interpreter waiting for a SQL query to run on another server?

Yet, of the three most popular web frameworks for Python async support is still not universal. FastAPI is async from the ground-up, Django has some support, but is [__"still working on async support"__](https://docs.djangoproject.com/en/5.2/topics/async/) in key areas like the ORM. Then Flask is and probably always will be synchronous (Quart is an async alternative with similar APIs). The most popular ORM for Python, SQLalchemy only [just got asyncio support in 2023](https://docs.sqlalchemy.org/en/20/changelog/migration_14.html#change-3414).

I posed the question _"Why isn't async more popular"_ to a couple of other developers to get their thoughts.

[Christopher Trudeau](https://realpython.com/team/ctrudeau/), co-host of the [Real Python Podcast](https://realpython.com/podcasts/rpp/), shared his perspective:

> Certain kinds of errors get caught by the compiler, others just disappear. Why didn't that function run? Oops, forgot to await it. Error in the coroutine? Did you remember to launch with the right params, if not, it doesn't percolate up. I still find threads easier to wrap my head around.

[Michael Kennedy](https://talkpython.fm/) offered some additional insight:

> The [GIL] is so omnipresent that most Python people never developed multithreaded/async thinking. Because async/await only works for I/O bound work, not CPU as well, it's of much less use. E.g. You can use in on the web, but most servers fork out to 4-8 web workers anyway

So **what's going on here** and **can we apply the lessons to Free-Threading and Multiple Interpreters in 3.14** so that in another ten years we're looking back and wondering why **they** aren't more popular?

## Problem 1: I have an asynchronous-shaped hole, now I need an asynchronous-shaped problem

_Coroutines_ are most valuable with IO-related tasks. In Python, you can start hundreds of coroutines to make network requests, then wait for them all to finish without running them one at a time. The concepts behind coroutines are quite straightforward. You have a loop (the event loop) and you pass it coroutines to evaluate.

Let's go back to the classic use-case: HTTP requests. They take ages and the protocol works well with coroutines. Let's say you have a function to fetch something from the net:

```python
def get_thing_sync():
    return http_client.get('/thing/which_takes?ages=1')
```

The equivalent async function is clean and readable:

```python
async def get_thing_async():
    return await http_client.get('/thing/which_takes?ages=1')
```

If you call function `get_thing_sync()` versus `await get_thing_async()`, they take **the same amount of time**. Calling it _"✨ asynchronously ✨"_ does not somehow make it faster. The gains are when you have more than one coroutine running at once. 

If you want to fetch several things from the Internet using a HTTP client, you can initiate all of those requests using the Operating-System's network stack and handle them one-at-a-time when they're finished. The important distinction is that some other process is handling the work whilst you wait for it to complete. Async works best when you have a system that can start work, it gives a task identifier and you have a library which can notify the coroutine when it's completed without using too many CPU cycles.

This HTTP scenario works well because:

1. The remote end is handling the work in another process
1. The local end (asyncio HTTP library) can yield control while waiting for the response
1. Operating-Systems have stacks and APIs for managing sockets and network

That's all fine, but I started with the statement **_Coroutines_ are most valuable with IO-related tasks.** I then picked the one task that asyncio can handle really well, HTTP requests.

What about disk IO? I have **far** more applications in Python which read and write from files on disks or memory than I do making HTTP requests. I also have Python programs which run other programs using `subprocess`.

Can I make all of those `async`?  

No, not really. From the [asyncio Wiki](https://github.com/python/asyncio/wiki/ThirdParty#filesystem):

> asyncio does not support asynchronous operations on the filesystem. Even if files are opened with O_NONBLOCK, read and write will block.

The solution is to use a third-party package, `aiofiles`, which gives you async file I/O capabilities:

```python
async with aiofiles.open('filename', mode='r') as f:
    contents = await f.read()
```

So, mission accomplished? No because `aiofiles` uses a **thread pool** to offload the blocking file I/O operations. It's an async API for a thread execution API since file IO in Python was never a GIL-blocking operation. Why?

### Side-Quest: Why isn't file IO async?

Windows has an async File IO API from 2021 called [IoRing](https://learn.microsoft.com/en-us/windows/win32/api/ioringapi/). Linux has this availability in newer Kernels via [`io_uring`](https://kernel.dk/io_uring.pdf). All I could find for a Python implementation of `io_uring` is this [synchronous API written in Cython](https://github.com/YoSTEALTH/Liburing).

There were io_uring APIs for other platforms, Rust has implementations with [tokio](https://github.com/tokio-rs/tokio-uring), C++ has [Asio](https://think-async.com/Asio/asio-1.24.0/doc/asio/history.html#asio.history.asio_1_21_0) and Node.JS has [libuv](https://www.phoronix.com/news/libuv-io-uring).

We could have async file IO in Python, but

1. __Most__ production Python applications run on Linux, where the implementation is `io_uring`
1. `io_uring` has been plagued by security issues so bad that RedHat, Google and others have restricted or removed it's availability. Google, after [paying out $1 million in bug bounties related to `io_uring` disabled it on their products](https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html). The issue was so bad, that 60% of Google's bug bounty submissions used exploitations in `io_uring`.

So we should hold our horses a little while longer. Operating Systems have long held a file IO API that handles threads for concurrent IO. It does the job just fine for now.

So in summary, _Coroutines are most valuable with IO-related tasks_ is only really true for **network IO** and network sockets in Python were never blocking operations in the first place. Socket open in Python is one of the few operations which releases the GIL and works [concurrently in a thread pool](https://github.com/python/cpython/blob/v3.14.0rc2/Modules/socketmodule.c#L939-L1085) as a non-blocking operation.

### Recap: What are the async operations in asyncio?

| Operation | Asyncio API | Description |
|-----------|--------------|-------------|
| Sleep     | [`asyncio.sleep()`](https://docs.python.org/3/library/asyncio-task.html#asyncio.sleep) | Asynchronously sleep for a given duration. |
| TCP/UDP Streams | [`asyncio.open_connection()`](https://docs.python.org/3/library/asyncio-stream.html#asyncio-streams) | Open a TCP/UDP connection. |
| HTTP      | [`aiohttp.ClientSession()`](https://docs.aiohttp.org/en/stable/client_reference.html#aiohttp.ClientSession) | Asynchronous HTTP client. |
| Run Subprocesses | [`asyncio.subprocess`](https://docs.python.org/3/library/asyncio-subprocess.html#asyncio-subprocess) | Asynchronously run subprocesses. |
| Queues    | [`asyncio.Queue`](https://docs.python.org/3/library/asyncio-queue.html#asyncio-queues) | Asynchronous queue implementation. |

## Problem 2: No matter how fast you run, you can't escape the GIL

The idea behind coroutines 

[Will McGugan](https://willmcgugan.github.io/), the creator of Rich, Textualize, and several other extremely popular Python libraries offered his perspective on async:

> I really enjoy async programming, but it isn't intuitive for most devs that don't have a background writing network code. A reoccurring problem I see with Textual is folk testing concurrency by dropping in a time.sleep(10) call to simulate the work they are planning. Of course, that blocks the entire loop. But that's a class of issue which is difficult to explain to devs who haven't used async much. i.e. what does it mean for code to "block", and when is it necessary to defer to threads.  Without that grounding in the fundamentals, your async code is going to misbehave, but its not going to break per se. So devs don't get the rapid iteration and feedback that we expect from Python.

Now that we've covered the limited use cases for async, another challenge keeps coming up. The Python GIL.

I've been working on this C#/Python bridge project called [CSnakes](https://tonybaloney.github.io/CSnakes), one of the features that caused the most head-scratching was [async](https://tonybaloney.github.io/CSnakes/v1/user-guide/async/).

C#, the language from which the [`async`/`await` syntax was borrowed](https://peps.python.org/pep-0492/#why-async-and-await-keywords), has a far-broader adoption of async in it's core IO libraries because it a [Task based Async Pattern](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model) where tasks are dispatched onto a managed thread pool. All disk, network, memory IO operations have async and sync methods.

In-fact the C# implementation goes all the way up from the disk to the higher-level APIs like serialization libraries. [JSON deserialization is async](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializer.deserializeasync?view=net-9.0#system-text-json-jsonserializer-deserializeasync(system-io-stream-system-type-system-text-json-serialization-jsonserializercontext-system-threading-cancellationtoken)), so is XML. 

The [C# Async model](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-based-asynchronous-programming) and the Python Async models have some important differences:

- C# creates a task pool and tasks are scheduled on this pool. The number of threads is managed automatically by the runtime.
- Python event loops belong to the thread that created them. C# tasks can be scheduled on any thread.
- Python async functions are coroutines that are scheduled on the event loop. C# async functions are tasks that are scheduled on the task pool.

The benefit of C#'s model is that a `Task` is a higher-level abstraction over a thread or coroutine. This means that you don't have to worry about the underlying thread management, you can schedule several tasks to be awaited concurrently or you can run them in parallel with Task Parallel Library (TPL).

Going back to Will's comment __"Of course, that blocks the entire loop"__, he's talking about operations inside async functions which are blocking and therefore block the entire event loop. Since we covered in Problem 1, that's essentially everything except network calls and sleeping. 

With Python's GIL, it doesn't matter if you're running 1 thread or 10, the GIL will lock everything so that only 1 is operating at a time.

![Breakdancing meme](/img/posts/breakdance.gif)

There are some operations don't block the GIL (e.g. File IO) and in those cases you can run them in threads. For example, if you used `httpx`'s streaming feature to stream a large network download onto disk:

```python
import httpx
import tempfile

def download_file(url: str):
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        with httpx.stream("GET", url) as response:
            for chunk in response.iter_bytes():
                tmp_file.write(chunk)
    return tmp_file.name
```

Neither the `httpx` stream iterator or `tmp_file.write` operations are GIL-blocking, so they benefit from being able to run in separate threads.

We can merge this behavior with an asyncio API, by using the[ Event Loop `run_in_executor()` function](https://docs.python.org/3/library/asyncio-eventloop.html#executing-code-in-thread-or-process-pools) and passing it a thread pool:

```python
import asyncio
import concurrent.futures

async def main():
    loop = asyncio.get_running_loop()

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        result = await loop.run_in_executor(
            pool, download_file, "https://example.com/large-file")
        print('custom thread pool', result)
```

We get ourselves into tangle following this pattern any further, since [call_soon](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.call_soon) isn't thread-safe. 

### Does the free-threaded mode make asyncio more useful or redundant?

## Problem 3: Maintaining two APIs is hard

### Maintaining two HTTP backends

- aiohttp https://github.com/aio-libs/aiohttp or encode's HTTPx https://www.python-httpx.org/async/

## Problem 4: Old habits are hard to break

## Problem 5: Obvious things are hard to do

 - async dunder methods?
 - file IO?
 - logging?
 - testing! /posts/async-test-patterns-for-pytest-and-unittest.html

## Problem 6: Going from sync to async and back again is hard

## Counter-point: This is as good as it gets.

## Python 3.14 Interpreter Pool Executor