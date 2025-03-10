/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

// import Router from "next/router";
import { supabase } from '@/lib/supabase';
// import { create } from "zustand";

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const PINECONE_NAME_SPACE = 'one';

// const PINECONE_NAME_SPACE = 'cnn'; //namespace is optional for your vectors

export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
