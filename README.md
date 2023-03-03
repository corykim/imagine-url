# ImagineURL

This webapp accepts a URL of a webpage, then attempts to generate an image that describes that page. The app does this
in the following steps:

- Fetch the web page
- Parse the content for salient text features
- Summarize the content using OpenAI
- Generate an image describing the content, using OpenAI

## Installation
### OpenAI API key
You must obtain an OpenAI API key. Visit the [OpenAI](https://platform.openai.com/account/api-keys) website and generate an API key. 

### Server
The server is found at `./server`. This script has been tested with Python 3.10. From a command line, run:
```bash
cd ./server
echo "OPENAI_API_KEY=[your-openai-api-key]" > .env.local
pip install -r requirements.txt
python main.py
```
This will start the server process on port 8000.

### Client
The client is found at `./client`. This is a React application, tested Node 18.12. From a command line, run:
```bash
cd ./client
npm install
npm start
```