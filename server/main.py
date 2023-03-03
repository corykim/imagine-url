import hashlib
import os
import re
from typing import List

import bs4.element
import openai
import requests
import uvicorn
from bs4 import BeautifulSoup
from dotenv_flow import dotenv_flow
from fastapi import FastAPI
from pydantic import BaseModel

dotenv_flow()
openai.api_key = os.getenv("OPENAI_API_KEY")
print(f'API key is [{openai.api_key}]')

app = FastAPI()

# store the contents of web pages here
page_cache = {}

# store page summaries here
summary_cache = {}

# store images here
image_cache = {}


def extract_text_from_element(element) -> List[str]:
    contents = []
    for content in element.contents:
        if isinstance(content, bs4.element.NavigableString):
            stripped = content.text.strip()
            if len(stripped) > 0:
                contents.append(stripped)

    return contents


def extract_page_content(url: str) -> str:
    if url in page_cache:
        return page_cache[url]

    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")

    tags = ['h1', 'p', 'div']
    limit = 1000

    page_content = ''

    for tag in tags:
        elements = soup.find_all(tag)
        for element in elements:
            contents = extract_text_from_element(element)
            for content in contents:
                if len(page_content) < limit:
                    page_content += ' ' + content

    content = re.sub("\\s+", " ", page_content)
    page_cache[url] = content
    return content


def hashify_text(text: str) -> str:
    m = hashlib.sha256()
    m.update(text.encode('utf-8'))
    return m.hexdigest()


def summarize_content(content: str) -> str:
    key = hashify_text(content)
    if key in summary_cache:
        return summary_cache[key]

    prompt = f'Summarize this for a second-grade student:\n{content}'
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=0.7,
        max_tokens=200,
        top_p=1.0,
        frequency_penalty=0.0,
        presence_penalty=0.0
    )
    summary = response.choices[0].text
    summary = re.sub("\\s+", " ", summary).strip()
    summary_cache[key] = summary
    return summary


def generate_image(prompt: str) -> str:
    key = hashify_text(prompt)
    if key in image_cache:
        return image_cache[key]

    response = openai.Image.create(
        prompt=prompt,
        n=1,
        size='1024x1024'
    )

    image = response['data'][0]['url']
    image_cache[key] = image
    return image


@app.get("/api/summarize")
def summarize(url: str):
    page_content = extract_page_content(url)
    print("Page Content:")
    print('*******')
    print(page_content)
    print('*******')

    summary = summarize_content(page_content)
    print("Summary:")
    print("*****")
    print(summary)
    print("*****")

    return {
        'url': url,
        'summary': summary
    }


@app.get("/api/imagine")
def imagine(url: str):
    summarized = summarize(url)
    summary = summarized['summary']

    image_url = generate_image(summary)
    print("Image:")
    print(image_url)

    return {
        'url': url,
        'image': image_url
    }


class ImageRequest(BaseModel):
    prompt: str


@app.post("/api/imagine")
def imagine_prompt(req: ImageRequest):
    image_url = generate_image(req.prompt)
    print("Image:")
    print(image_url)

    return {
        'prompt': req.prompt,
        'image': image_url
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
