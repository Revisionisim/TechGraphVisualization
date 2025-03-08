# 爬虫爬取输入词条的百度百科
import requests
import re


# 获取词条的url
def get_url(word):
    url = 'https://baike.baidu.com/item/' + word
    return url

# 获取词条的html


def get_html(url):
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        r.encoding = 'utf-8'
        return r.text
    except:
        return 'error'


# 获取词条的标题
def get_title(html):
    try:
        title = re.findall(r'<title>.*?</title>', html)[0]
        title = title.replace('<title>', '')
        title = title.replace('_百度百科</title>', '')
        return title
    except:
        return 'error'

# 获取词条的简介


def get_summary(html):

    try:
        summary = re.findall(
            r'<div class="lemma-summary" label-module="lemmaSummary">.*?</div>', html)[0]
        summary = summary.replace(
            '<div class="lemma-summary" label-module="lemmaSummary">', '')
        summary = summary.replace('</div>', '')
        return summary
    except:
        return 'error'

    # 输入词条，获取词条的html，标题，简介


def main(word):
    url = get_url(word)
    html = get_html(url)
    title = get_title(html)
    summary = get_summary(html)
    print(title)
    print(summary)


# 主函数
if __name__ == '__main__':
    word = input('请输入词条：')
    main(word)
