blog_heading: Writing Python Extensions in Assembly
blog_subheading: A deep-dive technical overview of how you can write CPython extensions in assembly
blog_header_image: posts/hammer-screw.jpeg
blog_author: Anthony Shaw
blog_publish_date: August 15, 2020
----------------------------------

On occasion, you need to take something apart and put it back together to fully understand it. I'm sure many of the people reading this article will have been one of those kids. Kids who will take a screwdriver to something, just to see whats inside.
It's a thrill, but its a whole different skill to put it back together.

The working machine on the outside hides a whole network of patterns, patches, and workarounds in its internals.

This experiment was no different. I wanted to see if I could write a CPython Extension in 100% assembly.

Why? Well, because after finishing the [CPython Internals book](https://realpython.com/cpython-book), the assembly code was still something of a mystery. I started learning x86-64 assembly from Jo Van Hooey's book and

1. You can only copy from memory to a CPU register
2. Addresses can be relative or absolute

```
mov DESTINATION, SOUCE
```



## Compilation, assembly and linking

## Extending setuptools/distutils

## GitHub CI/CD workflows

##
