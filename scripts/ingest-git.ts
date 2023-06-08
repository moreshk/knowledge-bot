import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { GithubRepoLoader } from 'langchain/document_loaders/web/github';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    // const directoryLoader = new DirectoryLoader(filePath, {
    //   '.pdf': (path) => new PDFLoader(path),
    // });

    const repoLoader = new GithubRepoLoader('https://github.com/moreshk/chatbot-ui', {
  branch: 'main', // use the "main" branch
  recursive: true, // load files from directories within the repository
  //unknown: UnknownHandling.Warn, // log a warning for files with unknown extensions
  // no need to set accessToken because the repo is public
  ignoreFiles: ['.gitignore', 'README.md'], // ignore these files
  ignorePaths: ['node_modules'], // ignore files in these directories
});


    // const loader = new PDFLoader(filePath);
    const rawDocs = await repoLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
