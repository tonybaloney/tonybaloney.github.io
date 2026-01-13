import json
import os
import markdown
import jinja2
import glob
from datetime import datetime
from email.utils import formatdate, format_datetime  # for RFC2822 formatting
import openai
import numpy as np
import dotenv

dotenv.load_dotenv()

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

# token = os.environ["GITHUB_TOKEN"]
# endpoint = "https://models.github.ai/inference"
# model_name = "openai/text-embedding-3-small"

endpoint = "http://localhost:11434/v1/"
model_name = "nomic-embed-text:latest"
token = "ollama"

client = openai.OpenAI(
        base_url=endpoint,
        api_key=token,
    )

def get_embedding(input: str):
    print(f"Calculating embedding for {input[:50]}")
    response = client.embeddings.create(
        input=[input],
        model=model_name,
        dimensions=512
    )
    return response.data[0].embedding

with open('embeddings.cache.json', "r") as f:
    contents = f.read()
    if not contents:
        _embeddings = {}
    else:
        _embeddings = json.loads(contents)

def cosine_similarity(a: list[float], b: list[float]) -> float:
    """
    Calculate the cosine similarity between two vectors
    """
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def get_closest_matches(post: dict, posts: list[dict]) -> tuple[dict, dict, dict]:
    # build them once
    for p in posts:
        if p["blog_heading"] not in _embeddings:
            _embeddings[p["blog_heading"]] = get_embedding(p["blog_heading"] + p["blog_subheading"])

    embedding = _embeddings[post["blog_heading"]]
    similarities = []
    for p in posts:
        post_embedding = _embeddings[p["blog_heading"]]
        similarity = cosine_similarity(embedding, post_embedding)
        similarities.append((p, similarity))
    similarities.sort(key=lambda x: x[1], reverse=True)
    return tuple(p for p, _ in similarities[1:4])

def main():
    posts = glob.glob("blog/*.md")
    extensions = [BootstrapExtension(), 'extra', 'smarty', 'meta', 'tables', 'toc']
    _md = markdown.Markdown(extensions=extensions, output_format='html5', extension_configs={'toc': {'permalink': True}})

    loader = jinja2.FileSystemLoader(searchpath="./")
    env = jinja2.Environment(loader=loader)

    all_posts = []
    for post in posts:
        print("rendering {0}".format(post))
        with open(post, encoding="utf-8") as post_f:
            _ = _md.convert(post_f.read()) # We only want metadata this time around, Markdown puts it in a module global for some odd reason.
        # Normalize path separators for cross-platform compatibility
        post_normalized = post.replace("\\", "/")
        url = post_normalized.replace(".md", ".html").replace("blog/", "posts/")
        meta = {}
        meta['card_image'] = _md.Meta.get('blog_card_image', _md.Meta['blog_header_image'])[0]
        meta['blog_heading'] = _md.Meta['blog_heading'][0]
        meta['blog_subheading'] = _md.Meta['blog_subheading'][0]
        meta['blog_header_image'] = _md.Meta['blog_header_image'][0]
        meta['blog_author'] = _md.Meta['blog_author'][0]
        meta['blog_publish_date'] = _md.Meta['blog_publish_date'][0]
        meta['date'] = datetime.strptime(_md.Meta['blog_publish_date'][0], "%B %d, %Y")
        meta['rfc2822_date'] = format_datetime(meta['date'])
        meta['link'] = "{0}{1}".format(BASE_URL, url)
        meta['rel_html_path'] = url
        meta['rel_md_path'] = post
        all_posts.append(meta)

    # Order blog posts by date published
    all_posts.sort(key=lambda item: item['date'], reverse=True)

    # render HTML
    for post in all_posts:
        post["related_0"], post["related_1"], post["related_2"] = get_closest_matches(post, all_posts)

        with open(post["rel_md_path"], encoding="utf-8") as post_f:
            html = _md.convert(post_f.read())
            doc = env.get_template(TEMPLATE_FILE).render(content=html, baseurl=BASE_URL, url=post["rel_html_path"], **post)

        with open(post["rel_html_path"], "w", encoding="utf-8") as post_html_f:
            post_html_f.write(doc)

    # Write the embedding cache back
    with open('embeddings.cache.json', "w") as f:
        json.dump(_embeddings, f)

    # Make the RSS feed
    with open("rss.xml", "w", encoding="utf-8") as rss_f:
        rss_f.write(env.get_template(FEED_TEMPLATE_FILE).render(posts=all_posts, date=formatdate()))


if __name__ == "__main__":
    main()