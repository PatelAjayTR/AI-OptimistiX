const env = require('dotenv')
const express = require('express');
const sp = require('@supabase/supabase-js')
const {OpenAI} = require('openai')
const fs = require("fs")

env.config();
const app = express();
const port = 3000;

const supabase = sp.createClient('https://hzimkjxtouwyfslgkoml.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aW1ranh0b3V3eWZzbGdrb21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ0MzU5MzQsImV4cCI6MjAxMDAxMTkzNH0.fhOSQjUtbLMS9c3IfMa76squR5QLukf2PcPIQL_saS4', {
    auth: {
        persistSession: false
    }
});

const openai = new OpenAI({
    apiKey: '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' // This is also the default, can be omitted
  });

//embed the given chunked text using openai embedding api to get vector
async function embedText(searchText) {
    try {
        const {OpenAIClient, AzureKeyCredential} = require("@azure/openai");

        const text = 'This is a large text and I am generating embeddings for numerical reference as system doesnt understand string';

        const client = new OpenAIClient("https://eastus-highq-lab-openai.openai.azure.com", new AzureKeyCredential("83cc6862e1c9464dbec0c9a814593780"));
        return await client.getEmbeddings('text-embedding-ada-002', [text]).then(async (res) => {
            // console.log(res.data[0].embedding);
            var embeddedData = res.data[0].embedding;
            await supabase
            .from("embedding_content")
            .insert({
                content: !searchText ? text : searchText,
                embedding: res.data[0].embedding,
            }).then((res) => {
                console.log(res);

                if(searchText)
                {
                    searchVectorInSupabase(embeddedData);
                }
            });
        });        
    
       
    } catch (error) {
        console.error(error);
    }
}

async function searchVectorInSupabase(embedding) {
    try {
        await supabase.rpc('search_data', {
            query_embedding: embedding,
            match_threshold: 0.78,
            match_count: 5,
        }).then((res) => {
            console.log(res.data);
        });
        // console.log(documents);
    } catch (error) {
        console.error("Error executing search query:", error);
    }
}

function GetInputQueryAndSearchVectorDB() {
    try {
        var query = "What is the size of the text and what is the type of embeddings?";
        //Step 1: Embed the user
        embedText(query).then((embedding) => {
            // Step 2: Search vector DB
            // searchVectorInSupabase(embedding);
        });
    } catch (error) {
        console.error(error);
    }
}

async function ReadDocumentContentToSupbaseDBTable() {
    try {
        fs.readFile("documents/abc.text", "utf8", (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            // Concatenate lines into a single paragraph
            const lines = data.split("\n");
            const concatenatedFileText = lines.join("™ ").trim().replace(/\s+/g, " ");
            // Create chunks of data
            const chunkSize = 500; // Adjust the chunk size as per your requirements
            const chunks = createChunks(concatenatedFileText, chunkSize);
            // Perform embedding on each chunk
            for (const chunk of chunks) {
                embedText('').then(async (result) => {
                 
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
}

//split the given text to chunks
function createChunks(inputText, chunksize) {
    const chunks = [];
    let i = 0;
    while (i < inputText.length) {
     chunks.push(inputText.slice(i, i + chunksize));
     i += chunksize;
    }
    return chunks;
  }


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    ReadDocumentContentToSupbaseDBTable();
    GetInputQueryAndSearchVectorDB();
});