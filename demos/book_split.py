"""
This is how I would translate a large document using GPT-4

prerequisites: 
- openai > 1.0
- langchain-text-splitters
- pypdf > 5
- python-dotenv
- tiktoken
"""
from typing import Generator
import pathlib
import os
import dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

dotenv.load_dotenv()

# Step 1: Load the English document

from pypdf import PdfReader


def get_pdf_contents(path: str | pathlib.Path) -> Generator[str, None, None]:
    with open(path, "rb") as f:
        reader = PdfReader(f)
        pages = reader.pages
        for _, p in enumerate(pages):
            page_text = p.extract_text()
            logger.info(f"Extracted text from page {p.page_number}, {len(page_text)} characters")
            yield page_text

# Step 2: Split the document into chunks based on the maximum token limit for the input in the
# GPT model

from langchain_text_splitters import RecursiveCharacterTextSplitter

MODEL = "gpt-4o-mini"  # The encoding would be the same for GPT-3.5 and GPT-4, but GPT-4o has a new tokenization standard
MAX_TOKENS = 4096  # Depends on the model deployment

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        model_name=MODEL,
        chunk_size=MAX_TOKENS,
        chunk_overlap=0,
    )

# If you're using public OpenAI, you'll need something like this
# from openai import OpenAI
# client = OpenAI(...)  # Depends on how you're using OpenAI


# If you're using Azure OpenAI, you'll need something like this
from openai import AzureOpenAI
client = AzureOpenAI(
        api_version="2024-02-15-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_KEY")
    )


def translate(text: str, target: str = "Japanese") -> str:
    prompt = f"Translate the following text to {target}:\n\n{text}"
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": prompt},
        ],
        temperature=0,
        n=1,
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <pdf-file>")
    filepath = sys.argv[1]
    contents = "\n".join(page for page in get_pdf_contents(filepath))
    logger.info(f"Extracted {len(contents)} characters from the PDF")
    chunks = text_splitter.split_text(contents)

    # Step 3: Translate the chunks
    result = ""
    logger.info(f"Translating {len(chunks)} chunks")
    for chunk in chunks:
        translation = translate(chunk, target="Japanese")
        result += translation
    
    # Step 4: Save the translations
    with open("translated.txt", "w", encoding="utf-8") as f:
        f.write(result)
