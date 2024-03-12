import markdown
import jinja2
import glob
from datetime import datetime
from email.utils import formatdate, format_datetime  # for RFC2822 formatting

from markdown.treeprocessors import Treeprocessor

TEMPLATE_FILE = "templates/blog_post_template.html"
FEED_TEMPLATE_FILE = "templates/rss_feed_template.xml"
BASE_URL = "https://tonybaloney.github.io/"


class BootstrapExtension(markdown.Extension):
    def extendMarkdown(self, md, md_globals):
        md.registerExtension(self)
        self.processor = BootstrapTreeprocessor()
        self.processor.md = md
        self.processor.config = self.getConfigs()
        md.treeprocessors.add('bootstrap', self.processor, '_end')


class BootstrapTreeprocessor(Treeprocessor):
    def run(self, node):
        for child in node.iter():
            if child.tag == 'table':
                child.set("class", "table")
            elif child.tag == 'img':
                child.set("class", "img-responsive center-block")

        return node


def main():
    posts = glob.glob("blog/*.md")
    extensions = [BootstrapExtension(), 'extra', 'smarty', 'meta', 'tables', 'toc']
    _md = markdown.Markdown(extensions=extensions, output_format='html5', extension_configs={'toc': {'permalink': True}})

    loader = jinja2.FileSystemLoader(searchpath="./")
    env = jinja2.Environment(loader=loader)

    all_posts = []
    for post in posts:
        print("rendering {0}".format(post))
        url = post.replace(".md", ".html").replace("blog/", "posts/")
        with open(post) as post_f:
            html = _md.convert(post_f.read())
            _md.Meta['card_image'] = _md.Meta.get('blog_card_image', _md.Meta['blog_header_image'])[0]
            doc = env.get_template(TEMPLATE_FILE).render(content=html, baseurl=BASE_URL, url=url, **_md.Meta)

        post_html = url
        with open(post_html, "w") as post_html_f:
            post_html_f.write(doc)
        post_date = datetime.strptime(_md.Meta['blog_publish_date'][0], "%B %d, %Y")
        all_posts.append(dict(**_md.Meta, date=post_date, rfc2822_date=format_datetime(post_date), link="{0}{1}".format(BASE_URL, url)))

    # Order blog posts by date published
    all_posts.sort(key=lambda item: item['date'], reverse=True)
    # Make the RSS feed
    with open("rss.xml", "w") as rss_f:
        rss_f.write(env.get_template(FEED_TEMPLATE_FILE).render(posts=all_posts, date=formatdate()))


if __name__ == "__main__":
    main()