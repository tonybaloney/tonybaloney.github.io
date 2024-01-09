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

def func():
    a = 1
    return a

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