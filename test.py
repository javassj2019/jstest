from urllib.request import urlretrieve

url = 'https://www.example.com'
output_file = 'cloned_site.html'

try:
    urlretrieve(url, output_file)
    print('网站已克隆')
except Exception as e:
    print(f'克隆网站时出错: {e}')