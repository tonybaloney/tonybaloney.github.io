from render_engine import Site, Page
import csv
from github import Github

# Authentication is defined via github.Auth
from github import Auth

import os

app = Site()

@app.page
class Index(Page):
  title="Anthony Shaw - home page"
  template="index.html"

  def __init__(self, *args,  **kwargs):
    self.template_vars = {}
    self.template_vars['podcasts'] = []
    self.template_vars['projects'] = []
    github_token = os.getenv("GITHUB_TOKEN", None)
    if github_token:
        auth = Auth.Token(github_token)
        # Public Web Github
        g = Github(auth=auth)
        for repo in g.get_user('tonybaloney').get_repos(type="public", sort="stars", direction="desc"):
            if repo.fork is False and repo.archived is False:
                self.template_vars['projects'].append({
                    'name': repo.name,
                    'url': repo.html_url,
                    'description': repo.description,
                    'stars': repo.stargazers_count
                })
        # Sort by 'stars'
        self.template_vars['projects'].sort(key=lambda x: x['stars'], reverse=True)
        self.template_vars['projects'] = self.template_vars['projects'][:20]


    with open('pages/podcasts.csv') as podcasts_file:
      reader = csv.DictReader(podcasts_file)
      for row in iter(reader):
        self.template_vars['podcasts'].append(row)

    super().__init__(*args, **kwargs)

if __name__ == '__main__':
    app.render()