def interpret(bytecodes):
    stack = []
    variables = {}
    for bytecode, arg in bytecodes:
        if bytecode == "LOAD_CONST":
            stack.append(arg)
        elif bytecode == "LOAD_FAST":
            stack.append(variables[arg])
        elif bytecode == "STORE_FAST":
            variables[arg] = stack.pop()
        elif bytecode == "RETURN_VALUE":
            return stack.pop()


def copy_and_patch_interpret(bytecodes):
    code = 'def f():\n'
    code += '  stack = []\n'
    code += '  variables = {}\n'
    for bytecode, arg in bytecodes:
        if bytecode == "LOAD_CONST":
            code += f'  stack.append({arg})\n'
        elif bytecode == "LOAD_FAST":
            code += f'  stack.append(variables["{arg}"])\n'
        elif bytecode == "STORE_FAST":
            code += f'  variables["{arg}"] = stack.pop()\n'
        elif bytecode == "RETURN_VALUE":
            code += '  return stack.pop()\n'
    code += 'f()'
    return code

func = (
    ("LOAD_CONST", 1),
    ("STORE_FAST", 'a'),
    ("LOAD_CONST", None),
    ("RETURN_VALUE", None)
)

def interpreter_loop():
    for _ in range(10_000):
        interpret(func)

def interpreter_copy_and_patch():
    compiled_function = compile(copy_and_patch_interpret(func), filename="<string>", mode="exec")
    for _ in range(10_000):
        exec(compiled_function)

__benchmarks__ = [
    (interpreter_loop, interpreter_copy_and_patch, "Use copy-and-patch JIT")
]