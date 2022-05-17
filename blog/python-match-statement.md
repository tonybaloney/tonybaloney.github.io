blog_heading: Using the Python match statement
blog_subheading: What is the match statement in Python and why should you use it
blog_header_image: posts/frogs.jpg
blog_author: Anthony Shaw
blog_publish_date: May 17, 2022
---

## Match is not a `switch` statement!

Let's get this out the way. The `match` statement **is not** a `switch` statement like you may be familiar with in C, C++, C# and many other languages.
You can use it as a switch statement, but there is little to be gained versus a series of `if..elif` statements.

The Python match statement is a pattern matching statement with a syntax of sub-expressions for:

- Matching the shape of a sequence
- Matching items in a sequence
- Matching keys and values in a dictionary
- Matching literal values

You can combine one or many of these into a single statement to filter data based on the input. This is called "structural pattern matching" and it's a feature of many functional programming languages.

## Sequence pattern matching

The match statement has a special syntax for matching sequences. The syntax uses `[]` square brackets, but it will match against **any** `Sequence` type (tuple, list, bytearray).

Starting with something simple. This function will return true if the input is a sequence that starts with a string literal of a unicode frog.

```python
from typing import Sequence

def starts_with_frog(seq: Sequence[str]) -> bool:
    """ Test matching the first element of a sequence is a frog. """
    match seq:
        case ["🐸", *_]: return True
        case _: return False

print(starts_with_frog(["🐸", "🐛", "🦋", "🪲"]))  # True
print(starts_with_frog(["🐛", "🦋", "🪲"])) # False

# Also works for tuples without modification
print(starts_with_frog(("🐸", "🐛", "🦋", "🪲")))  # True

# You can throw all sorts of junk at the function without it crashing
print(starts_with_frog(None)) # False
print(starts_with_frog("ribbit")) # False
print(starts_with_frog("🐸")) # False
```

The equivalent Python code would be expressed as:

```python
def starts_with_frog(seq: Sequence[str]) -> bool:
    if isinstance(seq, Sequence) and len(seq) > 0 and seq[0] == "🐸": 
        return True
    return False
```

So what is to be gained by using the match statement? Well, the match statement version is 86% faster! This is because the expression for sequence matching compiles into instructions that are far more efficient than a chained if-statement.

With the match statement, cases are evaluated in order. Use this to set specific cases at the top and then get more generic as you go down. For sequence matching, you can use the wildcard `*_` expression to match `n` items.

You can use the `[]` expression to match an empty sequence and then afterward use `[*_]` to match any other sequence:

```python
from typing import Sequence

def describe(seq: Sequence[str]) -> str:
    match seq:
        case ["🐸", *_, "🦋", "🌼"]: return "Starts with frog and ends with a flower, with a butterfly in between"
        case ["🐸", *_, "🦋"]: return "Starts with frog and ends with a butterfly"
        case [*_, "🦋"]: return "Ends with a butterfly"
        case ["🐸", *_, "🌼"]: return "Starts with frog"
        case ["🐸", *_]: return "Starts with frog"
        case []: return "An empty sequence"
        case [*_]: return "A sequence of things"
        case _: return "Not a sequence"

print(describe(["🐸", "🐸", "🐸"])) # Starts with frog
print(describe(["🐸", "🦋"])) # Starts with frog and ends with a butterfly
print(describe(["🐸", "🦋", "🌼"])) # Starts with frog and ends with a flower, with a butterfly in between
print(describe(None)) # Not a sequence
```

The `*_` wildcard uses the throwaway variable name `_`. You can replace this with a name to use that variable within the case block:

```python
from typing import Sequence

def describe(seq: Sequence[str]) -> str:
    match seq:
        case ["🐸", *others]: return f"Starts with frog and ends with {others}"
        case _: return "Not sure"

print(describe(["🐸", "🐸", "🐸"])) # Starts with frog and ends with ['🐸', '🐸']
```

You can use "sub-patterns" in sequence matching to match different cases within any of the items. Use parenthesis to mark a group and the `|` pipe operator to indicate and "or" clause:

```python
from typing import Sequence

def describe(seq: Sequence[str]) -> str:
    match seq:
        case ["🐸", ("🌹" | "🌸" | "🌺" | "🌻" | "🌼")]: return f"A frog and a flower"
        case _: return "Not sure"
```

## Literal matching

Case statements can include any literal, like a string literal, a number, a boolean, `None`.

Update the example to match against a single string literal with the frog:

```python
from typing import Any

def describe(seq: Any) -> str:
    match seq:
        case ["🐸", *others]: return f"Starts with frog and ends with {others}"
        case "🐸": return "A frog"
        case _: return "No idea"

print(describe(["🐸", "🐸", "🐸"])) # Starts with frog and ends with ['🐸', '🐸']
print(describe("🐸")) # A frog
```

Literal matching is the closest to a `switch` statement, but as we covered at the beginning, you can combine it with any of the other pattern matching expressions.

Literal matching can also include the `|` pipe operator or indicate `or` expressions

```python
def describe(seq) -> str:
    match seq:
        case ["🐸", *others]: return f"A frog and {others}"
        case "🐸" | "🤴": return "A frog or a prince?"
        case "👸": return "A princess"
        case "😘": return "A kiss"
        case _: return "Not sure"

print(describe("🐸")) # A frog or a prince?
print(describe("🤴")) # A frog or a prince?
print(describe("😘")) # A kiss
print(describe(None)) # Not sure
```

To complete this function, lets replace the sequence case with a recursive call to describe each of the elements in the sequence:

```python
def describe(seq) -> str:
    match seq:
        case [*others]: return ", ".join(describe(other) for other in others)
        case "🐸" | "🤴": return "A frog or a prince?"
        case "👸": return "A princess"
        case "😘": return "A kiss"
        case _: return "Not sure"

print(describe("🐸")) # A frog or a prince?
print(describe(["🐸", "👸", "😘", "🤴"])) # A frog or a prince?, A princess, A kiss, A frog or a prince?
```

## Matching mappings

The match statement has a syntax for matching keys and values in mapping types (dictionaries and subclasses of dictionaries).

Say you have an API that takes semi-structured JSON data as the input:

```json
{
    "name": "Charles Leclerc",
    "team": "Ferrari",
    "height": 179
}
```

The JSON data is then deserialized using `json.load()`, but you need to cater for a few scenarios:

- The user did not include the `team` field, so we need to look this up
- The user did include the `height` field, so we need to look this up
- The user did not submit the required fields

You can express mapping matches by using the `{}` curly braces and then one or many keys you want to match using literals. You can then use named expressions, or the `_` throwaway name to capture that data for the case block:

```python
def add_driver(driver):
    match driver:
        case {"name": name, "team": team, "height": height}: insert_driver_record(name, team, height)
        case {"name": name, "height": height}: insert_driver_record(name, lookup_team(name), height)
        case {"name": name}: insert_driver_record(name, lookup_team(name), lookup_height(height))
        case _: raise ValueError("Invalid request. Missing required fields")
```

Importantly, the mapping matching will check for the existence of the keys regardless of what other data is in the dictionary.

If you want to capture the other keys and values, you can use the `**` expression with a named variable:

```python
def add_driver(driver):
    match driver:
        case {"name": name, "team": team, "height": height, **extra}: insert_driver_record(name, team, height, extra)
```

## Matching objects

Finally, and perhaps the most powerful feature of the match statement is object matching.

Take this basic class structure based on the API we just described with the attributes `name`, `team` and `extra`:

```python
class Driver:
    def __init__(self, name, team, **extra):
        self.name = name
        self.team = team
        self.extra = extra
```

You can use object pattern matching to match cases of the attributes of those classes:

```python
def describe_driver(driver):
    match driver:
        case Driver(name="Max Verstappen"): return f"Max Verstappen, the current world #1"
        case Driver(name=name, team="Ferrari"): return f"{name}, a Ferrari driver!! 🐎"
        case Driver(name=name, team=team): return f"{name}, a {team} driver."
        case _: raise ValueError("Invalid request")

drivers = [
    Driver(name="Max Verstappen", team="Red Bull", ),
    Driver(name="Sergio Perez", team="Red Bull", ),
    Driver(name="Charles Leclerc", team="Ferrari", ),
    Driver(name="Lewis Hamilton", team="Mercedes", ),
]

for driver in drivers:
    print(describe_driver(driver))

"""
Result:
Max Verstappen, the current world #1
Sergio Perez, a Red Bull driver.
Charles Leclerc, a Ferrari driver!! 🐎
Lewis Hamilton, a Mercedes driver.
"""
```

## Conclusion

I hope this has been insightful and you can see where you can replace messy, nested if-statements with fast and clean `match` statements.

Please Share this article.