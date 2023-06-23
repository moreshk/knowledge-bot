import { RecursiveCharacterTextSplitter, MarkdownTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

export const run = async (url: string, namespace: string) => {
    try {
        const loader = new CheerioWebBaseLoader(url);
        const rawMarkdownData = await loader.load();
        /* Split text into chunks */
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 4000,
            chunkOverlap: 800,
        });

        const docs = await textSplitter.splitDocuments(rawMarkdownData);
        console.log('split docs', docs);

        console.log('creating vector store...');
        /*create and store the embeddings in the vectorStore*/
        const embeddings = new OpenAIEmbeddings();
        const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

        //embed the PDF documents
        await PineconeStore.fromDocuments(docs, embeddings, {
            pineconeIndex: index,
            namespace: namespace,
            textKey: 'text',
        });
    } catch (error) {
        console.log('error', error);
        throw new Error('Failed to ingest your data');
    }
};

// (async () => {
//     const url: string = "https://edition.cnn.com/europe/live-news/russia-ukraine-war-news-06-07-23/index.html";  // replace with the URL you want to process
//     const namespace: string = "1";  // replace with the namespace you want to use
//     await run(url, namespace);
//     console.log('ingestion complete');
// })();
