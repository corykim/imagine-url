import './App.scss';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    Heading,
    Image,
    Input,
    Spinner,
    VStack
} from "@chakra-ui/react";
import React, {useCallback, useEffect, useMemo, useState} from "react";

function App() {
    // const INITIAL_URL = 'https://www.dltk-teach.com/rhymes/goldilocks_story.htm';
    const INITIAL_URL = '';

    const [url, setUrl] = useState(INITIAL_URL);
    const [summary, setSummary] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [image, setImage] = useState('');
    const [imageLoading, setImageLoading] = useState(false);
    const [loadingError, setLoadingError] = useState('');
    const [imageError, setImageError] = useState(false);

    function handleChangeUrl(evt: React.ChangeEvent<HTMLInputElement>) {
        setUrl(evt.target.value)
    }

    function handleKeyDown(evt: React.KeyboardEvent) {
        if (evt.code === 'Enter') {
            handleSubmit();
        }
    }

    function resetUrl() {
        setUrl('');
    }

    const fetchSummary = useCallback(() => {
        console.log('getSummary', url);
        setSummaryLoading(true)
        fetch('/api/summarize?' + new URLSearchParams({
            url
        })).then((response) => response.json())
            .then((data) => {
                console.log('data', data)
                setSummary(data.summary)
            })
            .catch((error) => {
                console.error('Got error summarizing page', url, error);
                setLoadingError("We're sorry, but we were unable to imagine that page!");
            })
            .finally(() => {
                setSummaryLoading(false);
            })
    }, [url, loadingError, setLoadingError, setSummary, setSummaryLoading])

    const fetchImage = useCallback(() => {
        console.log('getImage', url);
        setImageLoading(true)
        fetch('/api/imagine?' + new URLSearchParams({
            url
        })).then((response) => response.json())
            .then((data) => {
                console.log('data', data)
                setImage(data.image)
            })
            .catch((error) => {
                console.error('Got error imagining page', url, error);
                setImageError(true);
            })
            .finally(() => {
                setImageLoading(false);
            })
    }, [url, setImage, setImageLoading, setImageError])


    function handleSubmit() {
        console.log("Go!");
        setSummary('');
        setImage('');
        setLoadingError('');
        setImageError(false);

        fetchSummary();
        fetchImage();
    }

    useEffect(() => {
        console.log('****** imageError', imageError)
    }, [imageError])

    const showSummary = useMemo<boolean>((): boolean => {
        return (summary || summaryLoading) as boolean
    }, [summary, summaryLoading])

    const showImage = useMemo<boolean>((): boolean => {
        return (image || imageLoading) as boolean
    }, [image, imageLoading])

    return (
        <div className="App">
            <VStack spacing={'2rem'}>
                <Heading>ImagineURL</Heading>
                <Box className={'intro'}>
                    Imagine your favorite web page as an image! Enter the URL of your favorite webpage, and I will
                    summarize the
                    page for you, then show it to you as a newly generated image.
                </Box>
                <Box className={'form'}>
                    <Input name={'url'} value={url} size={'lg'} maxWidth={'100rem'} minWidth={'50vw'}
                           placeholder={'Enter the URL of a web page you would like to imagine'}
                           onChange={handleChangeUrl}
                           onClick={resetUrl}
                           onKeyDown={handleKeyDown}
                    />
                    {loadingError && <Alert status={'error'}>
                      <AlertIcon/>
                      <AlertDescription>{loadingError}</AlertDescription></Alert>}
                    <Button colorScheme={'blue'} size={'lg'} onClick={handleSubmit}>Go</Button>
                </Box>
                {showSummary && <Box className={'summary'}>
                  <Heading size={'md'}>Here's how I imagine your page:</Heading>
                  <Box className={'text'}>
                      {summary}
                  </Box>
                    {showImage && <Box className={'image'}>
                        {(summaryLoading || imageLoading) && <MySpinner/>}
                        {image && <Image src={image} alt={summary}/>}
                    </Box>
                    }
                    {imageError &&
                      <Alert status={'warning'}>
                        <AlertIcon/>
                        <AlertDescription>We're sorry, but we were unable to produce an
                          image for your page. This page may contain sensitive content.</AlertDescription></Alert>}
                </Box>}
            </VStack>
        </div>
    );
}

function MySpinner() {
    return <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
    />
}

export default App;
