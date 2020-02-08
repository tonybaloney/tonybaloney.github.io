import markdown
import jinja2
import sys
import glob

def main():
    posts = glob.glob("blog/*.md")
    print(posts)
    extensions = ['extra', 'smarty', 'meta']
    _md = markdown.Markdown(extensions=extensions, output_format='html5')

    templateLoader = jinja2.FileSystemLoader(searchpath="./")
    templateEnv = jinja2.Environment(loader=templateLoader)
    TEMPLATE_FILE = "_blog_template.html"
    template = templateEnv.get_template(TEMPLATE_FILE)

    for post in posts:
        print("rendering {0}".format(post))

        with open(post) as post_f:
            html = _md.convert(post_f.read())
            doc = template.render(content=html, **_md.Meta)

        post_html = post.replace(".md", ".html").replace("blog/", "posts/")
        with open(post_html, "w") as post_html_f:
            post_html_f.write(doc)


if __name__ == "__main__":
    main()