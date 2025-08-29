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

The role of coroutines and their benefits are best seen in code which has a lot of IO-related waiting. 



C#, the language from which the [`async`/`await` syntax was borrowed](https://peps.python.org/pep-0492/#why-async-and-await-keywords), has a 

```csharp

```

### Memorizing caveats

## Problem 2: No matter how fast you run, you can't escape the GIL

The idea behind coroutines 

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