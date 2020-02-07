import markdown
import jinja2
import argparse
import sys


def parse_args(args=None):
    d = 'Make a complete, styled HTML document from a Markdown file.'
    parser = argparse.ArgumentParser(description=d)
    parser.add_argument('mdfile', type=argparse.FileType('r'), nargs='?',
                        default=sys.stdin,
                        help='File to convert. Defaults to stdin.')
    parser.add_argument('-o', '--out', type=argparse.FileType('w'),
                        default=sys.stdout,
                        help='Output file name. Defaults to stdout.')
    return parser.parse_args(args)


def main(args=None):
    args = parse_args(args)
    md = args.mdfile.read()
    extensions = ['extra', 'smarty', 'meta']
    _md = markdown.Markdown(extensions=extensions, output_format='html5')
    html = _md.convert(md)
    templateLoader = jinja2.FileSystemLoader(searchpath="./")
    templateEnv = jinja2.Environment(loader=templateLoader)
    TEMPLATE_FILE = "_blog_template.html"
    template = templateEnv.get_template(TEMPLATE_FILE)
    doc = template.render(content=html, **_md.Meta)
    args.out.write(doc)


if __name__ == "__main__":
    main()