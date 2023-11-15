from render_engine import Site, Page
import csv
app = Site()

@app.page
class Index(Page):
  title="Anthony Shaw - home page"
  template="index.html"

  def __init__(self, *args,  **kwargs):
    self.template_vars = {}
    self.template_vars['podcasts'] = []
    with open('pages/podcasts.csv') as podcasts_file:
      reader = csv.DictReader(podcasts_file)
      for i, row in enumerate(reader):
        self.template_vars['podcasts'].append(row)

    super().__init__(*args, **kwargs)

if __name__ == '__main__':
    app.render()