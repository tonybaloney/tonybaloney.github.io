from pathlib import Path
import markdown
import jinja2


def main():
    extensions = ['extra', 'smarty', 'meta']
    _md = markdown.Markdown(extensions=extensions, output_format='html5')

    templateLoader = jinja2.FileSystemLoader(searchpath='./')
    templateEnv = jinja2.Environment(loader=templateLoader)
    TEMPLATE_FILE = '_blog_template.html'
    template = templateEnv.get_template(TEMPLATE_FILE)
    
    for post in Path('./').glob('*.md'):
        print(f'Rendering {post.stem}')
        url = f'posts/{post.stem}.html'
        html = _md.convert(post.read_text())
        doc = template.render(content=html, baseurl='https://tonybaloney.github.io/', url=url, **_md.Meta)
        Path(f'./{url}').write_text(doc)


if __name__ == '__main__':
    main()
